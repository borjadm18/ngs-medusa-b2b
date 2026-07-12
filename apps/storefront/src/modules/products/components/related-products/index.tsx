import { listProducts } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { ClientProfile, clientProfile } from "@/lib/client-profile"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { getProductPrice } from "@/lib/util/get-product-price"
import { ArrowRight } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
  profile?: ClientProfile
}

export default async function RelatedProducts({
  product,
  countryCode,
  profile,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductParams & {
    limit?: number
    tag_id?: string[]
    collection_id?: string[]
    is_giftcard?: boolean
  } = {}

  if (region?.id) {
    queryParams.region_id = region.id
  }

  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }

  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((tag) => tag.id)
      .filter(Boolean) as string[]
  }

  queryParams.is_giftcard = false
  queryParams.limit = 4

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) =>
    response.products.filter((item) => item.id !== product.id).slice(0, 4)
  )

  if (!products.length) {
    return null
  }

  return (
    <section className="grid gap-5 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-950">
          Productos relacionados
        </h2>
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center gap-2 text-sm font-semibold"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </LocalizedClientLink>
      </div>
      <ul className="grid gap-3 xsmall:grid-cols-2 medium:grid-cols-4">
        {products.map((relatedProduct) => {
          const { cheapestPrice } = getProductPrice({ product: relatedProduct })
          const image =
            relatedProduct.thumbnail || relatedProduct.images?.[0]?.url

          return (
            <li key={relatedProduct.id}>
              <LocalizedClientLink
                href={`/products/${relatedProduct.handle}`}
                className="group block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-950"
              >
                <div className="relative aspect-square rounded bg-neutral-50">
                  {image && (
                    <Image
                      src={image}
                      alt={relatedProduct.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-contain p-4"
                    />
                  )}
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase text-neutral-500">
                  {relatedProduct.categories?.[0]?.name ||
                    profile?.fallbacks.productCategoryLabel ||
                    clientProfile.fallbacks.productCategoryLabel}
                </p>
                <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-neutral-950">
                  {relatedProduct.title}
                </h3>
                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  {cheapestPrice?.calculated_price || "Consultar"}
                </p>
                <p className="mt-2 text-xs text-green-600">En stock</p>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
