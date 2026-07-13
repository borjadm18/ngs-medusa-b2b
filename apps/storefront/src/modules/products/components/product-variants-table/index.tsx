import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import { getCatalogRuleSummary } from "@/lib/util/catalog-rules"
import { StoreProductPackaging } from "@/lib/data/product-packaging"
import { getVariantPackaging, PurchaseUnit } from "@/lib/util/b2b-packaging"
import { getProductPrice } from "@/lib/util/get-product-price"
import { convertToLocale } from "@/lib/util/money"
import Button from "@/modules/common/components/button"
import FilePlus from "@/modules/common/icons/file-plus"
import ShoppingBag from "@/modules/common/icons/shopping-bag"
import { HttpTypes, StoreProduct, StoreProductVariant } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { useState } from "react"
import BulkTableQuantity from "../bulk-table-quantity"

const ProductVariantsTable = ({
  product,
  region,
  packagingByVariantId = {},
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  packagingByVariantId?: Record<string, StoreProductPackaging>
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
        minimumOrderQuantity: number
        quantityIncrement: number
        boxesPerPallet?: number
        packageWeight?: number
        packageDimensions?: string
      }
    >
  >(new Map())

  const totalUnits = Array.from(lineItemsMap.values()).reduce(
    (acc, curr) => acc + curr.quantity,
    0
  )
  const { cheapestPrice } = getProductPrice({ product })
  const totalPrice = Array.from(lineItemsMap.values()).reduce((acc, lineItem) => {
    const { variantPrice } = getProductPrice({
      product,
      variantId: lineItem.id,
    })
    const unitPrice = Number(variantPrice?.calculated_price_number || 0)

    return acc + unitPrice * lineItem.quantity
  }, 0)
  const totalCurrency =
    Array.from(lineItemsMap.values())
      .map((lineItem) =>
        getProductPrice({
          product,
          variantId: lineItem.id,
        }).variantPrice?.currency_code
      )
      .find(Boolean) ||
    cheapestPrice?.currency_code ||
    region.currency_code
  const formattedTotal =
    totalUnits > 0
      ? convertToLocale({
          amount: totalPrice,
          currency_code: totalCurrency,
        })
      : null
  const catalogRuleSummary = getCatalogRuleSummary(product)
  const priceRule = catalogRuleSummary?.priceRule

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
      const packaging = getVariantPackaging(
        product,
        variant,
        packagingByVariantId[variantId]
      )
      const nextPurchaseUnit = purchaseUnit ?? existing?.purchaseUnit ?? "unit"
      const normalizedPackageQuantity = normalizePackageQuantity({
        packageQuantity,
        purchaseUnit: nextPurchaseUnit,
        unitsPerBox: packaging.unitsPerBox,
        minimumOrderQuantity: packaging.minimumOrderQuantity,
        quantityIncrement: packaging.quantityIncrement,
      })
      const quantity =
        nextPurchaseUnit === "box"
          ? normalizedPackageQuantity * packaging.unitsPerBox
          : normalizedPackageQuantity

      newLineItems.set(variantId, {
        ...(existing ?? variant),
        product,
        packageQuantity: normalizedPackageQuantity,
        purchaseUnit: nextPurchaseUnit,
        unitsPerBox: packaging.unitsPerBox,
        minimumOrderQuantity: packaging.minimumOrderQuantity,
        quantityIncrement: packaging.quantityIncrement,
        boxesPerPallet: packaging.palletUnits,
        packageWeight: packaging.packageWeight,
        packageDimensions: packaging.packageDimensions,
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
          minimumOrderQuantity,
          quantityIncrement,
          boxesPerPallet,
          packageWeight,
          packageDimensions,
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
            minimum_order_quantity: minimumOrderQuantity,
            quantity_increment: quantityIncrement,
            boxes_per_pallet: boxesPerPallet,
            package_weight: packageWeight,
            package_dimensions: packageDimensions,
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
        <div className="border-b border-neutral-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-neutral-950">
                Configura tu pedido
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Compra por unidad o caja completa. El carrito recibira la
                cantidad total de unidades.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-neutral-500">Desde</p>
              <p className="text-2xl font-semibold text-neutral-950">
                {cheapestPrice?.calculated_price || "Consultar"}
              </p>
              <p className="text-[11px] uppercase text-neutral-500">Sin IVA</p>
            </div>
          </div>

          {priceRule && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-neutral-950">
                  {priceRule.effect_type === "discount_percentage"
                    ? `${priceRule.discount_percentage}% dto. B2B aplicado`
                    : "Precio fijo B2B aplicado"}
                </span>
                {priceRule.minimum_quantity > 1 && (
                  <span className="text-neutral-500">
                    Min. {priceRule.minimum_quantity} uds
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="divide-y divide-neutral-200">
          {product.variants?.map((variant) => {
            const { variantPrice } = getProductPrice({
              product,
              variantId: variant.id,
            })
            const packaging = getVariantPackaging(
              product,
              variant,
              packagingByVariantId[variant.id]
            )
            const selectedLineItem = lineItemsMap.get(variant.id)
            const visibleOptions = variant.options?.filter(
              (option) => option.value !== "Default option value"
            )

            return (
              <article
                key={variant.id}
                className={clx(
                  "grid gap-4 px-5 py-4 transition-colors small:grid-cols-[minmax(0,1fr)_auto] small:items-center",
                  selectedLineItem?.quantity
                    ? "bg-neutral-50"
                    : "bg-white hover:bg-neutral-50"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <VariantSwatches options={visibleOptions} />
                    <p className="text-sm font-semibold text-neutral-950">
                      {visibleOptions && visibleOptions.length > 0
                        ? visibleOptions
                            .map((option) => option.value)
                            .join(" / ")
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
                    {packaging.minimumOrderQuantity > 1 && (
                      <span>
                        <span className="text-neutral-500">Min.</span>{" "}
                        <strong className="font-semibold text-neutral-950">
                          {packaging.minimumOrderQuantity} uds
                        </strong>
                      </span>
                    )}
                    {packaging.quantityIncrement > 1 && (
                      <span>
                        <span className="text-neutral-500">Multiplo</span>{" "}
                        <strong className="font-semibold text-neutral-950">
                          {packaging.quantityIncrement}
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
                    value={selectedLineItem?.packageQuantity ?? 0}
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
          : `Anadir ${formattedTotal} (${totalUnits} uds) al carrito`}
      </Button>

      <Button
        variant="secondary"
        className="h-11 w-full rounded-lg text-sm"
        disabled={totalUnits === 0}
        onClick={handleAddToCart}
      >
        <FilePlus />
        {totalUnits === 0
          ? "Solicitar presupuesto"
          : "Anadir seleccion al presupuesto"}
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
            "h-8 flex-1 rounded-md px-2 text-xs font-medium transition-colors",
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

const normalizePackageQuantity = ({
  packageQuantity,
  purchaseUnit,
  unitsPerBox,
  minimumOrderQuantity,
  quantityIncrement,
}: {
  packageQuantity: number
  purchaseUnit: PurchaseUnit
  unitsPerBox: number
  minimumOrderQuantity: number
  quantityIncrement: number
}) => {
  if (packageQuantity <= 0) {
    return 0
  }

  if (purchaseUnit === "box") {
    let boxes = Math.max(
      packageQuantity,
      Math.ceil(minimumOrderQuantity / unitsPerBox)
    )

    while ((boxes * unitsPerBox) % quantityIncrement !== 0) {
      boxes += 1
    }

    return boxes
  }

  const minimum = Math.max(minimumOrderQuantity, 1)
  const increment = Math.max(quantityIncrement, 1)
  const units = Math.max(packageQuantity, minimum)
  const remainder = (units - minimum) % increment

  return remainder === 0 ? units : units + increment - remainder
}

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111",
  blanco: "#ffffff",
  blue: "#2563eb",
  gris: "#737373",
  grey: "#737373",
  negro: "#111111",
  red: "#d71920",
  rojo: "#d71920",
  silver: "#c0c0c0",
  white: "#ffffff",
}

const VariantSwatches = ({
  options,
}: {
  options?: HttpTypes.StoreProductVariant["options"]
}) => {
  const colorOptions = options?.filter((option) => {
    const optionTitle = [
      (option as any).option?.title,
      (option as any).option?.value,
      (option as any).option_title,
      (option as any).title,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return (
      optionTitle.includes("color") ||
      optionTitle.includes("colour") ||
      !!COLOR_SWATCHES[String(option.value).toLowerCase()]
    )
  })

  if (!colorOptions?.length) {
    return null
  }

  return (
    <span className="flex items-center gap-1">
      {colorOptions.map((option) => {
        const color = COLOR_SWATCHES[String(option.value).toLowerCase()]

        if (!color) {
          return null
        }

        return (
          <span
            key={option.id}
            aria-label={`Color ${option.value}`}
            title={String(option.value)}
            className="inline-block h-4 w-4 rounded-full border border-neutral-300"
            style={{ backgroundColor: color }}
          />
        )
      })}
    </span>
  )
}

export default ProductVariantsTable
