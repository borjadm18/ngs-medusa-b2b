import {
  getInventorySummary,
  getProductHighlights,
  getProductSeries,
  getProductSubtitle,
} from "@/lib/util/product-technical-profile"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const firstVariant = product.variants?.[0]
  const inventory = getInventorySummary(product)
  const highlights = getProductHighlights(product)
  const category = product.categories?.[0]?.name

  return (
    <section id="product-info" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
          {getProductSeries(product)}
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
          <span
            className={
              inventory.tone === "green"
                ? "h-2 w-2 rounded-full bg-green-500"
                : inventory.tone === "amber"
                ? "h-2 w-2 rounded-full bg-amber-500"
                : "h-2 w-2 rounded-full bg-red-500"
            }
          />
          {inventory.label}
        </div>
      </div>

      <h1
        className="mt-4 text-[36px] font-semibold leading-[1.02] tracking-normal text-neutral-950 small:text-[52px]"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-neutral-200 pb-5 text-sm text-neutral-600">
        {firstVariant?.sku && (
          <span>
            SKU:{" "}
            <strong className="font-semibold text-neutral-950">
              {firstVariant.sku}
            </strong>
          </span>
        )}
        {category && (
          <span>
            Categoría:{" "}
            <strong className="font-semibold text-neutral-950">
              {category}
            </strong>
          </span>
        )}
        {product.collection?.title && (
          <span>
            Colección:{" "}
            <strong className="font-semibold text-neutral-950">
              {product.collection.title}
            </strong>
          </span>
        )}
      </div>

      <p
        className="mt-5 max-w-2xl text-sm leading-6 text-neutral-700"
        data-testid="product-description"
      >
        {getProductSubtitle(product)}
      </p>

      {highlights.length > 0 && (
        <ul className="mt-7 grid grid-cols-2 gap-3 medium:grid-cols-4">
          {highlights.map((highlight) => (
            <li key={highlight.label} className="rounded-lg bg-white p-3">
              <CheckCircleSolid className="mb-2 h-5 w-5 text-neutral-950" />
              <p className="text-base font-semibold text-neutral-950">
                {highlight.value}
              </p>
              <p className="mt-1 text-xs leading-4 text-neutral-500">
                {highlight.label}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductInfo
