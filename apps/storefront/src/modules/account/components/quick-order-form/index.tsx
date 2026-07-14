"use client"

import {
  QuickOrderResolvedItem,
  resolveQuickOrderSkus,
} from "@/lib/data/quick-order"
import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import Button from "@/modules/common/components/button"
import { StoreProduct, StoreProductVariant } from "@medusajs/types"
import { toast } from "@medusajs/ui"
import Link from "next/link"
import { ChangeEvent, useMemo, useState, useTransition } from "react"

type PurchaseUnit = "unit" | "box"

type QuickOrderDraftLine = {
  sku: string
  quantity: number
  purchaseUnit: PurchaseUnit
  sourceLine: number
  resolved?: QuickOrderResolvedItem
  error?: string
}

type QuickOrderFormProps = {
  regionId: string
}

type ParsedQuickOrder = {
  lines: QuickOrderDraftLine[]
  errors: string[]
}

const templateCsv = `sku,quantity,purchase_unit
NGS-WILD-BASH-COMPACT-BLK,2,box
NGS-EVO-MOUSE-WHT,24,unit`

const exampleCsv = `sku,quantity,purchase_unit
NGS-WILD-BASH-COMPACT-BLK,2,box
NGS-EVO-MOUSE-WHT,24,unit`

const splitDelimitedLine = (line: string) => {
  const delimiter = line.includes("\t")
    ? "\t"
    : line.split(";").length > line.split(",").length
    ? ";"
    : ","
  const cells: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"' && nextChar === '"') {
      cell += '"'
      index++
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === delimiter && !quoted) {
      cells.push(cell.trim())
      cell = ""
      continue
    }

    cell += char
  }

  cells.push(cell.trim())

  return cells
}

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]/g, "")

const looksLikeHeader = (cells: string[]) => {
  const firstCell = normalizeHeader(cells[0] || "")
  const quantityCell = normalizeHeader(cells[1] || "")

  return (
    ["sku", "ref", "referencia", "reference"].includes(firstCell) ||
    ["quantity", "qty", "cantidad"].includes(quantityCell)
  )
}

const parsePurchaseUnit = (value: string): PurchaseUnit => {
  const normalized = normalizeHeader(value)

  if (["box", "caja", "cajas", "case", "pack"].includes(normalized)) {
    return "box"
  }

  return "unit"
}

const parseLines = (value: string): ParsedQuickOrder => {
  const errors: string[] = []
  const lines = value
    .split(/\r?\n/)
    .map((line, index) => ({
      value: line.trim(),
      sourceLine: index + 1,
    }))
    .filter((line) => line.value)
    .reduce<QuickOrderDraftLine[]>((acc, line, index) => {
      const [sku = "", quantity = "1", purchaseUnit = "unit"] =
        splitDelimitedLine(line.value)

      if (index === 0 && looksLikeHeader([sku, quantity, purchaseUnit])) {
        return acc
      }

      const normalizedSku = sku.trim().toUpperCase()
      const parsedQuantity = Number.parseInt(quantity, 10)

      if (!normalizedSku) {
        errors.push(`Linea ${line.sourceLine}: falta SKU`)
        return acc
      }

      if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
        errors.push(`Linea ${line.sourceLine}: cantidad invalida`)
      }

      acc.push({
        sku: normalizedSku,
        quantity: Math.max(parsedQuantity || 1, 1),
        purchaseUnit: parsePurchaseUnit(purchaseUnit),
        sourceLine: line.sourceLine,
      })

      return acc
    }, [])

  return {
    lines,
    errors,
  }
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

const getPackageQuantity = (line: QuickOrderDraftLine) => {
  const packaging = line.resolved?.packaging

  if (!packaging || line.purchaseUnit !== "box") {
    return 0
  }

  return line.quantity
}

const getEstimatedWeight = (line: QuickOrderDraftLine) => {
  const packaging = line.resolved?.packaging
  const packageQuantity = getPackageQuantity(line)

  if (!packaging?.package_weight || !packageQuantity) {
    return 0
  }

  return packaging.package_weight * packageQuantity
}

const getPalletShare = (line: QuickOrderDraftLine) => {
  const packaging = line.resolved?.packaging
  const packageQuantity = getPackageQuantity(line)

  if (!packaging?.boxes_per_pallet || !packageQuantity) {
    return 0
  }

  return packageQuantity / packaging.boxes_per_pallet
}

const lineRequiresQuote = (line: QuickOrderDraftLine) =>
  line.resolved?.catalog_rule_summary?.requires_quote === true

const buildMetadata = (line: QuickOrderDraftLine) => {
  const packaging = line.resolved?.packaging
  const totalUnits = getTotalUnits(line)
  const requiresQuote = lineRequiresQuote(line)

  if (!packaging) {
    return {
      purchase_unit: line.purchaseUnit,
      unit_quantity: totalUnits,
      requires_quote: requiresQuote,
      catalog_rule_requires_quote: requiresQuote,
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
    requires_quote: requiresQuote,
    catalog_rule_requires_quote: requiresQuote,
  }
}

const QuickOrderForm = ({ regionId }: QuickOrderFormProps) => {
  const [rawInput, setRawInput] = useState(exampleCsv)
  const [lines, setLines] = useState<QuickOrderDraftLine[]>([])
  const [missingSkus, setMissingSkus] = useState<string[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
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
  const quickOrderSummary = useMemo(
    () =>
      validLines.reduce(
        (summary, line) => {
          const boxes = getPackageQuantity(line)

          summary.boxes += boxes
          summary.looseUnits += line.purchaseUnit === "unit" ? line.quantity : 0
          summary.estimatedWeight += getEstimatedWeight(line)
          summary.palletShare += getPalletShare(line)
          summary.quoteRequiredLines += lineRequiresQuote(line) ? 1 : 0

          return summary
        },
        {
          boxes: 0,
          looseUnits: 0,
          estimatedWeight: 0,
          palletShare: 0,
          quoteRequiredLines: 0,
        }
      ),
    [validLines]
  )
  const errorLines = useMemo(
    () => lines.filter((line) => line.error).length + parseErrors.length,
    [lines, parseErrors]
  )

  const handleResolve = () => {
    const parsed = parseLines(rawInput)
    const draftLines = parsed.lines

    setParseErrors(parsed.errors)

    if (!draftLines.length) {
      toast.error("Introduce al menos un SKU")
      return
    }

    startTransition(async () => {
      const result = await resolveQuickOrderSkus(
        draftLines.map((line) => line.sku),
        regionId
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

  const removeLine = (index: number) => {
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Sube CSV/TSV o pega columnas desde Excel")
      event.target.value = ""
      return
    }

    const content = await file.text()
    setRawInput(content)
    setLines([])
    setMissingSkus([])
    setParseErrors([])
    toast.success(`${file.name} cargado`)
    event.target.value = ""
  }

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "quick-order-template.csv"
    link.click()
    URL.revokeObjectURL(url)
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
          Pedido rapido por SKU
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Pega columnas desde Excel o sube CSV/TSV con SKU, cantidad y unidad de
          compra.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-medium text-neutral-800 transition hover:border-neutral-950">
            Subir CSV/TSV
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </label>
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-md border border-neutral-200 px-3 py-2 font-medium text-neutral-800 transition hover:border-neutral-950"
          >
            Descargar plantilla
          </button>
          <button
            type="button"
            onClick={() => setRawInput(exampleCsv)}
            className="rounded-md border border-neutral-200 px-3 py-2 font-medium text-neutral-800 transition hover:border-neutral-950"
          >
            Cargar ejemplo
          </button>
        </div>
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
              setParseErrors([])
            }}
          >
            Limpiar
          </Button>
        </div>
      </div>

      {parseErrors.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-semibold">Errores de formato</p>
          <ul className="mt-1 list-disc pl-5">
            {parseErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

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
                {validLines.length} validas / {errorLines} con revision /{" "}
                {totalUnits} unidades
              </p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !validLines.length}
            >
              {isAdding ? "Anadiendo..." : "Anadir al carrito"}
            </Button>
          </div>
          <div className="grid gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-4 small:grid-cols-6">
            <QuickOrderMetric label="Lineas validas" value={validLines.length} />
            <QuickOrderMetric label="Unidades" value={totalUnits} />
            <QuickOrderMetric label="Cajas" value={quickOrderSummary.boxes} />
            <QuickOrderMetric
              label="Peso estimado"
              value={
                quickOrderSummary.estimatedWeight
                  ? `${quickOrderSummary.estimatedWeight.toFixed(1)} kg`
                  : "-"
              }
            />
            <QuickOrderMetric
              label="Ocupacion pallet"
              value={
                quickOrderSummary.palletShare
                  ? `${quickOrderSummary.palletShare.toFixed(2)}`
                : "-"
              }
            />
            <QuickOrderMetric
              label="Presupuesto"
              value={quickOrderSummary.quoteRequiredLines}
            />
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
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
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
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Linea {line.sourceLine}
                        </p>
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
                          ? `Caja ${packaging.units_per_box} uds / min. ${packaging.minimum_order_quantity} / multiplo ${packaging.quantity_increment}${
                              packaging.boxes_per_pallet
                                ? ` / pallet ${packaging.boxes_per_pallet} cajas`
                                : ""
                            }`
                          : "Sin regla"}
                        {line.purchaseUnit === "box" && packaging ? (
                          <p className="mt-1 text-[11px] text-neutral-400">
                            {line.quantity} cajas x {packaging.units_per_box}{" "}
                            uds = {getTotalUnits(line)} uds
                          </p>
                        ) : null}
                        {lineRequiresQuote(line) ? (
                          <span className="mt-2 inline-flex rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-700">
                            Requiere presupuesto
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {line.error ? (
                          <span className="inline-flex rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                            {line.error}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Listo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-xs font-medium text-neutral-500 underline hover:text-neutral-950"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
            <p className="text-xs text-neutral-500">
              El carrito conservara unidades, cajas, peso y ocupacion de pallet
              para presupuesto y validacion de checkout.
            </p>
            <Link
              href="/cart"
              className="text-xs font-semibold text-neutral-950 underline"
            >
              Revisar carrito y presupuesto
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const QuickOrderMetric = ({
  label,
  value,
}: {
  label: string
  value: string | number
}) => (
  <div className="rounded-md border border-neutral-200 bg-white px-3 py-2">
    <p className="text-[11px] uppercase text-neutral-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-neutral-950">{value}</p>
  </div>
)

export default QuickOrderForm
