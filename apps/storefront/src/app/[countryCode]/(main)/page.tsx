import { listCategories } from "@/lib/data/categories"
import { getHomepageContent } from "@/lib/data/homepage"
import { listProducts } from "@/lib/data/products"
import { getBaseURL } from "@/lib/util/env"
import { NgsHomepage } from "@/modules/home/templates/ngs-homepage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "NGS | Audio profesional B2B",
  description:
    "Portal B2B NGS para comprar altavoces profesionales, accesorios y soluciones de audio con precios por cuenta desde Medusa.",
  alternates: {
    canonical: `${getBaseURL()}/es`,
  },
  openGraph: {
    title: "NGS | Audio profesional B2B",
    description:
      "Altavoces profesionales y soluciones de audio para empresas, retail, hostelería, eventos e instalaciones.",
    images: ["/images/ngs/home-hero-ngs-speakers.png"],
  },
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const [categories, productsResult, homepage] = await Promise.all([
    listCategories({ limit: 12 }).catch(() => []),
    listProducts({
      countryCode,
      queryParams: {
        limit: 5,
      },
    }).catch(() => null),
    getHomepageContent(),
  ])

  const products = productsResult?.response.products || []
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NGS",
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
