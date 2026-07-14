"use client"

import {
  QuickOrderResolvedItem,
  resolveQuickOrderSkus,
} from "@/lib/data/quick-order"
import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import Button from "@/modules/common/components/button"
import { StoreProduct, StoreProductVariant } from "@medusajs/types"
import { toast } from "@medusajs/ui"
import { useMemo, useState, useTransition } from "react"

type PurchaseUnit = "unit" | "box"

type QuickOrderDraftLine = {
  sku: string
  quantity: number
  purchaseUnit: PurchaseUnit
  resolved?: QuickOrderResolvedItem
  error?: string
}

type QuickOrderFormProps = {
  regionId: string
}

const exampleCsv = `NGS-WILD-BASH-COMPACT-BLK,2,box
NGS-EVO-MOUSE-WHT,24,unit`

const parseLines = (value: string): QuickOrderDraftLine[] => {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sku = "", quantity = "1", purchaseUnit = "unit"] = line
        .split(/[,\t;]/)
        .map((part) => part.trim())

      return {
        sku: sku.toUpperCase(),
        quantity: Math.max(Number.parseInt(quantity, 10) || 1, 1),
        purchaseUnit:
          purchaseUnit.toLowerCase() === "box" ? "box" : ("unit" as const),
      }
    })
}

const validateLine = (line: QuickOrderDraftLine) => {
  const packaging = line.resolved?.packaging

  if (!line.resolved) {
    return "SKU no encontrado"
  }

  if (!packaging) {
    return undefined
  }

  const totalUnits =
    line.purchaseUnit === "box"
      ? line.quantity * packaging.units_per_box
      : line.quantity

  if (totalUnits < packaging.minimum_order_quantity) {
    return `Minimo ${packaging.minimum_order_quantity} uds`
  }

  if (totalUnits % packaging.quantity_increment !== 0) {
    return `Multiplo ${packaging.quantity_increment} uds`
  }

  return undefined
}

const getTotalUnits = (line: QuickOrderDraftLine) => {
  if (line.purchaseUnit === "box") {
    return line.quantity * (line.resolved?.packaging?.units_per_box || 1)
  }

  return line.quantity
}

const buildMetadata = (line: QuickOrderDraftLine) => {
  const packaging = line.resolved?.packaging
  const totalUnits = getTotalUnits(line)

  if (!packaging) {
    return {
      purchase_unit: line.purchaseUnit,
      unit_quantity: totalUnits,
    }
  }

  return {
    purchase_unit: line.purchaseUnit,
    package_quantity: line.purchaseUnit === "box" ? line.quantity : totalUnits,
    units_per_box: packaging.units_per_box,
    unit_quantity: totalUnits,
    minimum_order_quantity: packaging.minimum_order_quantity,
    quantity_increment: packaging.quantity_increment,
    boxes_per_pallet: packaging.boxes_per_pallet,
    package_weight: packaging.package_weight,
    package_dimensions: packaging.package_dimensions,
  }
}

const QuickOrderForm = ({ regionId }: QuickOrderFormProps) => {
  const [rawInput, setRawInput] = useState(exampleCsv)
  const [lines, setLines] = useState<QuickOrderDraftLine[]>([])
  const [missingSkus, setMissingSkus] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [isAdding, setIsAdding] = useState(false)

  const validLines = useMemo(
    () => lines.filter((line) => line.resolved && !line.error),
    [lines]
  )
  const totalUnits = useMemo(
    () => validLines.reduce((acc, line) => acc + getTotalUnits(line), 0),
    [validLines]
  )

  const handleResolve = () => {
    const draftLines = parseLines(rawInput)

    if (!draftLines.length) {
      toast.error("Introduce al menos un SKU")
      return
    }

    startTransition(async () => {
      const result = await resolveQuickOrderSkus(
        draftLines.map((line) => line.sku)
      ).catch((error) => {
        toast.error(error.message || "No se pudo resolver el pedido rapido")
        return null
      })

      if (!result) {
        return
      }

      const resolvedBySku = new Map(
        result.items.map((item) => [item.sku.toUpperCase(), item])
      )

      setMissingSkus(result.missing_skus || [])
      setLines(
        draftLines.map((line) => {
          const resolved = resolvedBySku.get(line.sku)
          const nextLine = {
            ...line,
            resolved,
          }

          return {
            ...nextLine,
            error: validateLine(nextLine),
          }
        })
      )
    })
  }

  const updateLine = (
    index: number,
    patch: Partial<Pick<QuickOrderDraftLine, "quantity" | "purchaseUnit">>
  ) => {
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line
        }

        const nextLine = {
          ...line,
          ...patch,
          quantity: Math.max(
            Number.parseInt(String(patch.quantity ?? line.quantity), 10) || 1,
            1
          ),
        }

        return {
          ...nextLine,
          error: validateLine(nextLine),
        }
      })
    )
  }

  const handleAddToCart = () => {
    if (!validLines.length) {
      toast.error("No hay lineas validas para anadir")
      return
    }

    setIsAdding(true)
    addToCartEventBus.emitCartAdd({
      regionId,
      lineItems: validLines.map((line) => {
        const resolved = line.resolved!
        return {
          productVariant: {
            ...resolved.variant,
            product: resolved.product as StoreProduct,
          } as StoreProductVariant & { product: StoreProduct },
          quantity: getTotalUnits(line),
          metadata: buildMetadata(line),
        }
      }),
    })
    setIsAdding(false)
    toast.success(`${validLines.length} lineas enviadas al carrito`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <label className="block text-sm font-semibold text-neutral-950">
          Pegar SKUs
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Formato: SKU, cantidad, unidad. Usa <span className="font-mono">unit</span>{" "}
          o <span className="font-mono">box</span>.
        </p>
        <textarea
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          className="mt-3 min-h-[150px] w-full rounded-md border border-neutral-200 bg-white p-3 font-mono text-sm outline-none focus:border-neutral-950"
          spellCheck={false}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={handleResolve} disabled={isPending}>
            {isPending ? "Resolviendo..." : "Resolver SKUs"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRawInput("")
              setLines([])
              setMissingSkus([])
            }}
          >
            Limpiar
          </Button>
        </div>
      </div>

      {missingSkus.length ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          SKUs no encontrados: {missingSkus.join(", ")}
        </div>
      ) : null}

      {lines.length ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-950">
                Pedido rapido
              </p>
              <p className="text-xs text-neutral-500">
                {validLines.length} lineas validas / {totalUnits} unidades
              </p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !validLines.length}
            >
              {isAdding ? "Anadiendo..." : "Anadir al carrito"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Compra</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Total uds</th>
                  <th className="px-4 py-3">Regla</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => {
                  const packaging = line.resolved?.packaging
                  return (
                    <tr
                      key={`${line.sku}-${index}`}
                      className="border-t border-neutral-100"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {line.sku}
                        {line.error ? (
                          <p className="mt-1 text-xs text-red-600">
                            {line.error}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-950">
                          {line.resolved?.product.title || "-"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {line.resolved?.variant.title || ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={line.purchaseUnit}
                          onChange={(event) =>
                            updateLine(index, {
                              purchaseUnit: event.target.value as PurchaseUnit,
                            })
                          }
                          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="unit">Unidades</option>
                          <option value="box">Cajas</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(index, {
                              quantity: Number(event.target.value),
                            })
                          }
                          className="w-24 rounded-md border border-neutral-200 px-3 py-2"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {getTotalUnits(line)}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {packaging
                          ? `Caja ${packaging.units_per_box} uds / min. ${packaging.minimum_order_quantity} / multiplo ${packaging.quantity_increment}`
                          : "Sin regla"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default QuickOrderForm
