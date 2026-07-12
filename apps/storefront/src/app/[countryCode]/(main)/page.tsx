import { clientProfile } from "@/lib/client-profile"
import { listCategories } from "@/lib/data/categories"
import {
  DEFAULT_HOMEPAGE_CONTENT,
  getHomepageContent,
} from "@/lib/data/homepage"
import { listProducts } from "@/lib/data/products"
import { getBaseURL } from "@/lib/util/env"
import { NgsHomepage } from "@/modules/home/templates/ngs-homepage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: clientProfile.seo.title,
  description: clientProfile.seo.description,
  alternates: {
    canonical: `${getBaseURL()}/es`,
  },
  openGraph: {
    title: clientProfile.seo.title,
    description: clientProfile.brand.tagline,
    images: [clientProfile.brand.logo.dark],
  },
}

const withTimeout = async <T,>(
  promise: Promise<T>,
  fallback: T,
  timeoutMs = 5000
): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout>

  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      timeout = setTimeout(() => resolve(fallback), timeoutMs)
    }),
  ]).finally(() => clearTimeout(timeout))
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const [categories, productsResult, homepage] = await Promise.all([
    withTimeout(listCategories({ limit: 12 }).catch(() => []), []),
    withTimeout(
      listProducts({
        countryCode,
        queryParams: {
          limit: 5,
        },
      }).catch(() => null),
      null
    ),
    withTimeout(getHomepageContent(), DEFAULT_HOMEPAGE_CONTENT),
  ])

  const products = productsResult?.response.products || []
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: clientProfile.brand.name,
    url: getBaseURL(),
    sameAs: [],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NgsHomepage
        content={homepage}
        categories={categories}
        products={products}
      />
    </>
  )
}
