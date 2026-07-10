import { listCategories } from "@/lib/data/categories"
import { getHomepageContent } from "@/lib/data/homepage"
import { listProducts } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import ProductPreview from "@/modules/products/components/product-preview"
import SkeletonFeaturedProducts from "@/modules/skeletons/templates/skeleton-featured-products"
import { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "NGS B2B | Portal mayorista",
  description:
    "Portal B2B NGS conectado a Medusa para distribuidores, empresas y compras recurrentes.",
}

const categoryImages = [
  "/images/ngs/home-range-speakers.jpg",
  "/images/ngs/home-detail-tweeter.jpg",
  "/images/ngs/home-detail-brand.jpg",
  "/images/ngs/home-hero-speakers.jpg",
]

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params
  const [categories, region, productsResult, homepage] = await Promise.all([
    listCategories({ limit: 6 }).catch(() => []),
    getRegion(countryCode).catch(() => null),
    listProducts({
      countryCode,
      queryParams: {
        limit: 8,
      },
    }).catch(() => null),
    getHomepageContent(),
  ])

  const products = productsResult?.response.products || []

  return (
    <main className="bg-white text-neutral-950">
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="content-container grid gap-8 py-8 small:grid-cols-[0.92fr_1.08fr] small:items-stretch small:py-12">
          <div className="flex min-h-[560px] flex-col justify-center gap-6">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-normal text-neutral-300">
              <span className="border border-neutral-700 px-3 py-1">
                {homepage.heroBadgePrimary}
              </span>
              <span className="border border-neutral-700 px-3 py-1">
                {homepage.heroBadgeSecondary}
              </span>
            </div>
            <div>
              <h1 className="max-w-3xl text-[38px] font-semibold leading-[1.04] small:text-[64px]">
                {homepage.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 small:text-lg">
                {homepage.heroBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LocalizedClientLink
                href={homepage.primaryCtaHref}
                className="bg-[#d71920] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b9151b]"
              >
                {homepage.primaryCtaLabel}
              </LocalizedClientLink>
              <LocalizedClientLink
                href={homepage.secondaryCtaHref}
                className="border border-neutral-500 px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                {homepage.secondaryCtaLabel}
              </LocalizedClientLink>
            </div>
            <div className="grid gap-3 pt-4 text-sm text-neutral-300 xsmall:grid-cols-3">
              {homepage.metrics.map(({ value, label }) => (
                <div key={label} className="border-l border-neutral-700 pl-4">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 leading-5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 small:min-h-[620px]">
            <Image
              src={homepage.heroImage}
              alt={homepage.heroImageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-black/70 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase text-[#ff4b4f]">
                {homepage.heroImageEyebrow}
              </p>
              <p className="mt-2 max-w-xl text-lg font-semibold">
                {homepage.heroImageTitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="content-container grid gap-3 py-5 text-sm small:grid-cols-4">
          {homepage.trustBlocks.map(({ title, body }) => (
            <div key={title} className="border border-neutral-200 bg-white p-4">
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-neutral-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-container py-10">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase text-[#d71920]">
            {homepage.capabilityEyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {homepage.capabilityTitle}
          </h2>
        </div>
        <div className="grid gap-3 small:grid-cols-3">
          {homepage.capabilityBlocks.map((block) => (
            <article
              key={block.title}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <div className="relative aspect-[16/10] bg-neutral-100">
                <Image
                  src={block.image}
                  alt={block.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{block.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {block.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-container py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 small:flex-row small:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-[#d71920]">
              {homepage.categoryEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {homepage.categoryTitle}
            </h2>
          </div>
          <LocalizedClientLink
            href="/store"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Ver todo el catalogo
          </LocalizedClientLink>
        </div>
        <div className="grid gap-3 xsmall:grid-cols-2 small:grid-cols-4">
          {categories
            .filter((category) => !category.parent_category)
            .slice(0, 4)
            .map((category, index) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-neutral-950"
              >
                <div className="relative aspect-[4/3] bg-neutral-100">
                  <Image
                    src={categoryImages[index % categoryImages.length]}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="flex min-h-[150px] flex-col justify-between p-5">
                  <p className="text-lg font-semibold">{category.name}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Catalogo, variantes y precio calculado por region.
                  </p>
                  <span className="mt-5 text-sm font-semibold text-[#d71920]">
                    Entrar
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-950 text-white">
        <div className="content-container py-10">
          <div className="mb-6 flex flex-col justify-between gap-4 small:flex-row small:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase text-[#ff4b4f]">
                {homepage.detailEyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {homepage.detailTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                {homepage.detailBody}
              </p>
            </div>
            <LocalizedClientLink
              href={homepage.detailCtaHref}
              className="border border-neutral-600 px-4 py-3 text-sm font-semibold transition hover:border-white"
            >
              {homepage.detailCtaLabel}
            </LocalizedClientLink>
          </div>
          <div className="grid gap-3 xsmall:grid-cols-2 small:grid-cols-4">
            {homepage.detailBlocks.map((block) => (
              <article
                key={block.title}
                className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"
              >
                <div className="relative aspect-[5/4]">
                  <Image
                    src={block.image}
                    alt={block.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold">{block.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    {block.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="content-container py-10">
          <div className="mb-6 flex flex-col justify-between gap-3 small:flex-row small:items-end">
            <div>
              <p className="text-xs font-semibold uppercase text-[#d71920]">
                {homepage.catalogEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {homepage.catalogTitle}
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-sm font-semibold underline underline-offset-4"
            >
              Abrir PLP
            </LocalizedClientLink>
          </div>
          <Suspense fallback={<SkeletonFeaturedProducts />}>
            {region && products.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 xsmall:grid-cols-2 small:grid-cols-4">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductPreview product={product} region={region} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
                Cuando el backend Medusa este levantado, aqui apareceran los
                productos con precios por region y cuenta.
              </div>
            )}
          </Suspense>
        </div>
      </section>

      <section className="content-container grid gap-6 py-12 small:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-xs font-semibold uppercase text-[#d71920]">
            {homepage.operationsEyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {homepage.operationsTitle}
          </h2>
        </div>
        <div className="grid gap-3">
          {homepage.operations.map((item) => (
            <div
              key={item}
              className="border-l-4 border-[#d71920] bg-neutral-50 p-4"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
