import { getProductByHandle } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { getProductPrice } from "@/lib/util/get-product-price"
import ProductTemplate from "@/modules/products/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamicParams = true
export const dynamic = "force-dynamic"

type Props = {
  params: { countryCode: string; handle: string }
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | NGS B2B`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | NGS B2B`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) {
    notFound()
  }
  const { cheapestPrice } = getProductPrice({ product: pricedProduct })
  const category = pricedProduct.categories?.[0]
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: pricedProduct.description || pricedProduct.subtitle,
    sku: pricedProduct.variants?.[0]?.sku,
    brand: {
      "@type": "Brand",
      name: "NGS",
    },
    image: pricedProduct.images?.map((image) => image.url).filter(Boolean),
    offers: cheapestPrice
      ? {
          "@type": "Offer",
          price: cheapestPrice.calculated_price_number,
          priceCurrency: cheapestPrice.currency_code?.toUpperCase(),
          availability: "https://schema.org/InStock",
        }
      : undefined,
  }
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `/${params.countryCode}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: `/${params.countryCode}/store`,
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `/${params.countryCode}/categories/${category.handle}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: pricedProduct.title,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
