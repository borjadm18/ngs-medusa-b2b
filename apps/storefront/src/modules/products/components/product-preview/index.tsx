import { getCatalogRuleSummary } from "@/lib/util/catalog-rules"
import { getProductPrice } from "@/lib/util/get-product-price"
import { getInventorySummary } from "@/lib/util/product-technical-profile"
import { HttpTypes } from "@medusajs/types"
import { Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewAddToCart from "./preview-add-to-cart"
import PreviewPrice from "./price"
import { PriceLoginGate } from "../price-login-gate"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  canViewPrices = false,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  canViewPrices?: boolean
}) {
  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  const inventory = getInventorySummary(product)
  const catalogRuleSummary = getCatalogRuleSummary(product)
  const priceRule = catalogRuleSummary?.priceRule

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="flex flex-col gap-4 relative aspect-[3/5] w-full overflow-hidden p-4 bg-white shadow-borders-base rounded-lg group-hover:shadow-[0_0_0_4px_rgba(0,0,0,0.1)] transition-shadow ease-in-out duration-150"
      >
        <div className="w-full h-full p-10">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            isFeatured={isFeatured}
          />
        </div>
        <div className="flex flex-col txt-compact-medium">
          <div className="flex flex-wrap items-center gap-2">
            <Text className="text-neutral-600 text-xs">MARCA</Text>
            {canViewPrices && priceRule && (
              <span className="rounded border border-neutral-950 bg-neutral-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                {priceRule.effect_type === "discount_percentage"
                  ? `${priceRule.discount_percentage}% B2B`
                  : "Precio B2B"}
              </span>
            )}
            {catalogRuleSummary?.requiresQuote && (
              <span className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral-700">
                Presupuesto
              </span>
            )}
          </div>
          <Text className="text-ui-fg-base" data-testid="product-title">
            {product.title}
          </Text>
        </div>
        <div className="flex flex-col gap-0">
          {canViewPrices && cheapestPrice ? (
            <>
              <PreviewPrice price={cheapestPrice} />
              <Text className="text-neutral-600 text-[0.6rem]">Sin IVA</Text>
            </>
          ) : (
            <PriceLoginGate compact />
          )}
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row gap-1 items-center">
            <span
              className={clx({
                "text-green-500": inventory.tone === "green",
                "text-orange-500":
                  inventory.tone === "amber",
                "text-red-500": inventory.tone === "red",
              })}
            >
              •
            </span>
            <Text className="text-neutral-600 text-xs">
              {inventory.label}
            </Text>
          </div>
          {canViewPrices && <PreviewAddToCart product={product} region={region} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
