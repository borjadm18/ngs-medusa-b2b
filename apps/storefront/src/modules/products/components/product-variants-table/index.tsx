import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import { getVariantPackaging, PurchaseUnit } from "@/lib/util/b2b-packaging"
import { getProductPrice } from "@/lib/util/get-product-price"
import Button from "@/modules/common/components/button"
import ShoppingBag from "@/modules/common/icons/shopping-bag"
import { HttpTypes, StoreProduct, StoreProductVariant } from "@medusajs/types"
import { clx, Table } from "@medusajs/ui"
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
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto p-px">
        <Table className="w-full rounded-lg overflow-hidden shadow-borders-base border-none">
          <Table.Header className="border-t-0">
            <Table.Row className="bg-neutral-100 border-none hover:!bg-neutral-100">
              <Table.HeaderCell className="px-4">SKU</Table.HeaderCell>
              {product.options?.map((option) => {
                if (option.title === "Default option") {
                  return null
                }

                return (
                  <Table.HeaderCell key={option.id} className="px-4 border-x">
                    {option.title}
                  </Table.HeaderCell>
                )
              })}
              <Table.HeaderCell className="px-4 border-x">
                Precio
              </Table.HeaderCell>
              <Table.HeaderCell className="px-4 border-x">
                Compra
              </Table.HeaderCell>
              <Table.HeaderCell className="px-4 border-x">
                Caja
              </Table.HeaderCell>
              <Table.HeaderCell className="px-4">Cantidad</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="border-none">
            {product.variants?.map((variant, index) => {
              const { variantPrice } = getProductPrice({
                product,
                variantId: variant.id,
              })
              const packaging = getVariantPackaging(product, variant)
              const selectedLineItem = lineItemsMap.get(variant.id)

              return (
                <Table.Row
                  key={variant.id}
                  className={clx({
                    "border-b-0": index === product.variants?.length! - 1,
                  })}
                >
                  <Table.Cell className="px-4">{variant.sku}</Table.Cell>
                  {variant.options?.map((option) => {
                    if (option.value === "Default option value") {
                      return null
                    }

                    return (
                      <Table.Cell key={option.id} className="px-4 border-x">
                        {option.value}
                      </Table.Cell>
                    )
                  })}
                  <Table.Cell className="px-4 border-x">
                    {variantPrice?.calculated_price}
                  </Table.Cell>
                  <Table.Cell className="px-4 border-x">
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
                  </Table.Cell>
                  <Table.Cell className="px-4 border-x text-xs text-neutral-600">
                    {packaging.unitsPerBox} uds/caja
                  </Table.Cell>
                  <Table.Cell className="pl-1 !pr-1">
                    <BulkTableQuantity
                      variantId={variant.id}
                      label={
                        selectedLineItem?.purchaseUnit === "box"
                          ? "cajas"
                          : "unidades"
                      }
                      onChange={(variantId, quantity) =>
                        handleLineItemChange(variantId, quantity)
                      }
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>

      <Button
        onClick={handleAddToCart}
        variant="primary"
        className="w-full h-10"
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
