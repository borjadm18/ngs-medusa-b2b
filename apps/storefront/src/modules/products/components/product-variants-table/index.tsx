import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import { getVariantPackaging, PurchaseUnit } from "@/lib/util/b2b-packaging"
import { getProductPrice } from "@/lib/util/get-product-price"
import Button from "@/modules/common/components/button"
import ShoppingBag from "@/modules/common/icons/shopping-bag"
import { HttpTypes, StoreProduct, StoreProductVariant } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { useState } from "react"
import BulkTableQuantity from "../bulk-table-quantity"

const ProductVariantsTable = ({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [lineItemsMap, setLineItemsMap] = useState<
    Map<
      string,
      StoreProductVariant & {
        product: StoreProduct
        quantity: number
        packageQuantity: number
        purchaseUnit: PurchaseUnit
        unitsPerBox: number
      }
    >
  >(new Map())

  const totalUnits = Array.from(lineItemsMap.values()).reduce(
    (acc, curr) => acc + curr.quantity,
    0
  )
  const totalPackages = Array.from(lineItemsMap.values()).reduce(
    (acc, curr) => acc + curr.packageQuantity,
    0
  )

  const handleLineItemChange = (
    variantId: string,
    packageQuantity: number,
    purchaseUnit?: PurchaseUnit
  ) => {
    setLineItemsMap((prev) => {
      const newLineItems = new Map(prev)
      const variant = product.variants?.find((v) => v.id === variantId)

      if (!variant) {
        return newLineItems
      }

      const existing = prev.get(variantId)
      const packaging = getVariantPackaging(product, variant)
      const nextPurchaseUnit = purchaseUnit ?? existing?.purchaseUnit ?? "unit"
      const quantity =
        nextPurchaseUnit === "box"
          ? packageQuantity * packaging.unitsPerBox
          : packageQuantity

      newLineItems.set(variantId, {
        ...(existing ?? variant),
        product,
        packageQuantity,
        purchaseUnit: nextPurchaseUnit,
        unitsPerBox: packaging.unitsPerBox,
        quantity,
      })

      return newLineItems
    })
  }

  const handleAddToCart = async () => {
    setIsAdding(true)

    const lineItems = Array.from(lineItemsMap.values())
      .filter((lineItem) => lineItem.quantity > 0)
      .map(
        ({
          quantity,
          packageQuantity,
          purchaseUnit,
          unitsPerBox,
          ...variant
        }) => ({
          productVariant: {
            ...variant,
          },
          quantity,
          metadata: {
            purchase_unit: purchaseUnit,
            package_quantity: packageQuantity,
            units_per_box: unitsPerBox,
            unit_quantity: quantity,
          },
        })
      )

    addToCartEventBus.emitCartAdd({
      lineItems,
      regionId: region.id,
    })

    setIsAdding(false)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-lg border border-neutral-200 bg-white shadow-borders-base">
        <div className="border-b border-neutral-200 px-4 py-3">
          <p className="text-sm font-semibold text-neutral-950">
            Compra B2B por variante
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Elige unidades sueltas o cajas completas. El carrito recibirá la
            cantidad total de unidades.
          </p>
        </div>

        <div className="divide-y divide-neutral-200">
          {product.variants?.map((variant) => {
            const { variantPrice } = getProductPrice({
              product,
              variantId: variant.id,
            })
            const packaging = getVariantPackaging(product, variant)
            const selectedLineItem = lineItemsMap.get(variant.id)
            const visibleOptions = variant.options?.filter(
              (option) => option.value !== "Default option value"
            )

            return (
              <article
                key={variant.id}
                className={clx(
                  "grid gap-4 px-4 py-4 transition-colors small:grid-cols-[minmax(0,1fr)_auto] small:items-center",
                  selectedLineItem?.quantity
                    ? "bg-neutral-50"
                    : "bg-white hover:bg-neutral-50"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-950">
                      {visibleOptions && visibleOptions.length > 0
                        ? visibleOptions.map((option) => option.value).join(" / ")
                        : variant.title}
                    </p>
                    {variant.sku && (
                      <span className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium uppercase text-neutral-500">
                        {variant.sku}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                    <span>
                      <span className="text-neutral-500">Precio</span>{" "}
                      <strong className="font-semibold text-neutral-950">
                        {variantPrice?.calculated_price ?? "Consultar"}
                      </strong>
                    </span>
                    <span>
                      <span className="text-neutral-500">Caja</span>{" "}
                      <strong className="font-semibold text-neutral-950">
                        {packaging.unitsPerBox} uds
                      </strong>
                    </span>
                    {packaging.palletUnits && (
                      <span>
                        <span className="text-neutral-500">Pallet</span>{" "}
                        <strong className="font-semibold text-neutral-950">
                          {packaging.palletUnits} uds
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 xsmall:grid-cols-[150px_132px] xsmall:items-center small:grid-cols-[142px_126px]">
                  <PurchaseUnitToggle
                    value={selectedLineItem?.purchaseUnit ?? "unit"}
                    onChange={(purchaseUnit) =>
                      handleLineItemChange(
                        variant.id,
                        selectedLineItem?.packageQuantity ?? 0,
                        purchaseUnit
                      )
                    }
                  />
                  <BulkTableQuantity
                    variantId={variant.id}
                    compact
                    label={
                      selectedLineItem?.purchaseUnit === "box"
                        ? "cajas"
                        : "unidades"
                    }
                    onChange={(variantId, quantity) =>
                      handleLineItemChange(variantId, quantity)
                    }
                  />
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        variant="primary"
        className="h-12 w-full rounded-lg text-sm"
        isLoading={isAdding}
        disabled={totalUnits === 0}
        data-testid="add-product-button"
      >
        <ShoppingBag
          className="text-white"
          fill={totalUnits === 0 ? "none" : "#fff"}
        />
        {totalUnits === 0
          ? "Selecciona cantidades"
          : `Añadir ${totalPackages} bulto${
              totalPackages === 1 ? "" : "s"
            } (${totalUnits} uds) al carrito`}
      </Button>
    </div>
  )
}

const PurchaseUnitToggle = ({
  value,
  onChange,
}: {
  value: PurchaseUnit
  onChange: (value: PurchaseUnit) => void
}) => {
  return (
    <div className="inline-flex min-w-[132px] rounded-lg border border-neutral-200 bg-white p-0.5">
      {(["unit", "box"] as PurchaseUnit[]).map((unit) => (
        <button
          key={unit}
          type="button"
          onClick={() => onChange(unit)}
          className={clx(
            "h-7 flex-1 rounded-md px-2 text-xs font-medium transition-colors",
            value === unit
              ? "bg-neutral-950 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          {unit === "unit" ? "Unidad" : "Caja"}
        </button>
      ))}
    </div>
  )
}

export default ProductVariantsTable
