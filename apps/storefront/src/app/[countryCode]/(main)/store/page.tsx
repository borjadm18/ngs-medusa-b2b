import { clientProfile, getClientSeoTitle } from "@/lib/client-profile"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import { listGlobalProductOptions } from "@/lib/data/product-options"
import { parseOptionValueIds } from "@/lib/util/option-value-query"
import SkeletonProductGrid from "@/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/modules/store/components/refinement-list"
import { SortOptions } from "@/modules/store/components/refinement-list/sort-products"
import StoreBreadcrumb from "@/modules/store/components/store-breadcrumb"
import PaginatedProducts from "@/modules/store/templates/paginated-products"
import { Metadata } from "next"
import { Suspense } from "react"

export const dynamicParams = true

export const metadata: Metadata = {
  title: getClientSeoTitle("Catalogo"),
  description: `Catalogo mayorista ${clientProfile.brand.name} con filtros, precios por region y disponibilidad.`,
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    optionValueIds?: string | string[]
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams

  const sort = sortBy || "created_at"
  const pageNumber = page ? parseInt(page) : 1
  const optionValueIds = parseOptionValueIds(searchParams)

  const [categories, customer, productOptions] = await Promise.all([
    listCategories(),
    retrieveCustomer(),
    listGlobalProductOptions(),
  ])

  return (
    <div className="bg-neutral-100">
      <section className="border-b border-neutral-200 bg-white">
        <div className="content-container py-8">
          <p className="text-xs font-semibold uppercase text-[#d71920]">
            Catalogo profesional
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Productos {clientProfile.brand.name} para compra B2B
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
            Filtra por categoria y atributos, revisa precio calculado por region
            y anade unidades al carrito para pedido o solicitud de presupuesto.
          </p>
        </div>
      </section>
      <div
        className="flex flex-col py-6 content-container gap-4"
        data-testid="category-container"
      >
        <StoreBreadcrumb />
        <div className="flex flex-col small:flex-row small:items-start gap-3">
          <RefinementList
            sortBy={sort}
            categories={categories}
            productOptions={productOptions}
          />
          <div className="w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={params.countryCode}
                customer={customer}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
