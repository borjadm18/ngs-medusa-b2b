"use client"

import { useCart } from "@/lib/context/cart-context"
import {
  formatPackagingDetails,
  formatPackagingLine,
  getCartLinePackaging,
} from "@/lib/util/b2b-packaging"
import AddNoteButton from "@/modules/cart/components/add-note-button"
import DeleteButton from "@/modules/common/components/delete-button"
import LineItemPrice from "@/modules/common/components/line-item-price"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Spinner from "@/modules/common/icons/spinner"
import Thumbnail from "@/modules/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"
import { clx, Container, Input } from "@medusajs/ui"
import { startTransition, useEffect, useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  showBorders?: boolean
  currencyCode: string
  disabled?: boolean
  showPrices?: boolean
}

const ItemFull = ({
  item,
  showBorders = true,
  currencyCode,
  disabled,
  showPrices = true,
}: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [quantity, setQuantity] = useState(item.quantity.toString())

  const { handleDeleteItem, handleUpdateCartQuantity } = useCart()
  const maxQuantity = item.variant?.inventory_quantity ?? 100
  const packaging = getCartLinePackaging(item.metadata, item.quantity)
  const currentPackageQuantity = packaging?.packageQuantity
  const maxDisplayQuantity = packaging
    ? Math.max(Math.floor(maxQuantity / packaging.unitsPerBox), 1)
    : maxQuantity
  const displayedQuantity = quantity
  const quantityLabel = packaging ? "cajas" : "uds"
  const packagingDetails = packaging ? formatPackagingDetails(packaging) : ""
  const brandName =
    typeof item.product?.metadata?.brand === "string"
      ? item.product.metadata.brand
      : typeof item.product?.metadata?.brand_name === "string"
      ? item.product.metadata.brand_name
      : "NGS"

  const changeQuantity = async (newQuantity: number) => {
    setError(null)
    // setUpdating(true)

    startTransition(() => {
      setQuantity(newQuantity.toString())
    })

    await handleUpdateCartQuantity(item.id, Number(newQuantity))
  }

  const changePackageQuantity = async (newPackageQuantity: number) => {
    if (!packaging) {
      return changeQuantity(newPackageQuantity)
    }

    const packageQuantity = Math.max(Math.floor(newPackageQuantity), 0)
    const unitQuantity = packageQuantity * packaging.unitsPerBox
    const nextMetadata = {
      ...(item.metadata || {}),
      package_quantity: packageQuantity,
      unit_quantity: unitQuantity,
    }

    setError(null)

    startTransition(() => {
      setQuantity(packageQuantity.toString())
    })

    await handleUpdateCartQuantity(item.id, unitQuantity, nextMetadata)
  }

  useEffect(() => {
    setQuantity(
      currentPackageQuantity
        ? currentPackageQuantity.toString()
        : item.quantity.toString()
    )
  }, [item.quantity, currentPackageQuantity])

  const handleBlur = (value: number) => {
    const compareValue = packaging ? packaging.packageQuantity : item.quantity

    if (value === compareValue) {
      return
    }

    if (value > maxDisplayQuantity) {
      packaging
        ? changePackageQuantity(maxDisplayQuantity)
        : changeQuantity(maxDisplayQuantity)
      return
    }

    if (value < 1) {
      setUpdating(true)
      handleDeleteItem(item.id)
      setUpdating(false)
      return
    }

    packaging ? changePackageQuantity(value) : changeQuantity(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

    if (e.key === "Enter") {
      packaging
        ? changePackageQuantity(Number(quantity))
        : changeQuantity(Number(quantity))
    }

    if (e.key === "ArrowUp" && e.shiftKey) {
      e.preventDefault()
      setQuantity((Number(quantity) + (packaging ? 1 : 10)).toString())
    }

    if (e.key === "ArrowDown" && e.shiftKey) {
      e.preventDefault()
      setQuantity((Number(quantity) - (packaging ? 1 : 10)).toString())
    }
  }

  return (
    <Container
      className={clx("flex gap-4 w-full h-full items-center justify-between", {
        "shadow-none": !showBorders,
      })}
    >
      <div className="flex gap-x-4 items-start">
        <LocalizedClientLink href={`/products/${item.product_handle}`}>
          <Thumbnail
            thumbnail={item.thumbnail}
            size="square"
            type="full"
            className="bg-neutral-100 rounded-lg w-20 h-20"
          />
        </LocalizedClientLink>
        <div className="flex flex-col gap-y-2 justify-between min-h-full self-stretch">
          <div className="flex flex-col">
            <span className="text-neutral-600 text-[0.6rem]">{brandName}</span>

            <span className="txt-medium-plus text-neutral-950">
              {item.product?.title}
            </span>
            <span className="text-neutral-600 text-xs">
              {item.variant?.title}
            </span>
            {packaging && (
              <div className="mt-2 grid gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs text-neutral-700">
                <span className="font-medium text-neutral-950">
                  {formatPackagingLine(packaging)}
                </span>
                {packagingDetails && <span>{packagingDetails}</span>}
              </div>
            )}
          </div>
          <div className="flex small:flex-row flex-col gap-2">
            {showPrices && (
              <LineItemPrice
                className="flex small:hidden self-start"
                item={item}
                currencyCode={currencyCode}
              />
            )}
            <div className="flex gap-x-2">
              <div className="flex gap-x-3 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-md w-fit p-px items-center">
                <button
                  className={clx(
                    "w-4 h-4 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-md text-md",
                    disabled ? "opacity-50 pointer-events-none" : "opacity-100"
                  )}
                  onClick={() =>
                    packaging
                      ? changePackageQuantity(packaging.packageQuantity - 1)
                      : changeQuantity(item.quantity - 1)
                  }
                  disabled={
                    (packaging ? packaging.packageQuantity <= 1 : item.quantity <= 1) ||
                    disabled
                  }
                >
                  -
                </button>
                <span className="w-4 h-4 flex items-center justify-center text-neutral-950 text-xs">
                  {updating ? (
                    <Spinner size="12" />
                  ) : (
                    <Input
                      className={clx(
                        "w-10 h-4 flex items-center justify-center text-center text-neutral-950 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent shadow-none",
                        disabled
                          ? "opacity-50 pointer-events-none"
                          : "opacity-100"
                      )}
                      type="number"
                      value={displayedQuantity}
                      onChange={(e) => {
                        setQuantity(e.target.value)
                      }}
                      onBlur={(e) => {
                        handleBlur(Number(e.target.value))
                      }}
                      onKeyDown={(e) => handleKeyDown(e)}
                      disabled={disabled}
                    />
                  )}
                </span>
                <button
                  className={clx(
                    "w-4 h-4 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-md text-md",
                    disabled ? "opacity-50 pointer-events-none" : "opacity-100"
                  )}
                  onClick={() =>
                    packaging
                      ? changePackageQuantity(packaging.packageQuantity + 1)
                      : changeQuantity(item.quantity + 1)
                  }
                  disabled={
                    (packaging
                      ? packaging.packageQuantity >= maxDisplayQuantity
                      : item.quantity >= maxQuantity) || disabled
                  }
                >
                  +
                </button>
              </div>

              <DeleteButton id={item.id} disabled={disabled} />
            </div>
            <span className="text-[11px] text-neutral-500">{quantityLabel}</span>
            <AddNoteButton
              item={item as HttpTypes.StoreCartLineItem}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between min-h-full self-stretch">
        {showPrices ? (
          <LineItemPrice
            className="hidden small:flex"
            item={item}
            currencyCode={currencyCode}
            style="default"
          />
        ) : (
          <span className="hidden rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 small:flex">
            Precio privado
          </span>
        )}
      </div>
    </Container>
  )
}

export default ItemFull
