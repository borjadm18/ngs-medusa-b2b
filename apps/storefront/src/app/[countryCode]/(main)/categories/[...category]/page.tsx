import { getClientSeoTitle } from "@/lib/client-profile"
import { getCategoryByHandle, listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import CategoryTemplate from "@/modules/categories/templates"
import { SortOptions } from "@/modules/store/components/refinement-list/sort-products"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamicParams = true
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  try {
    const product_category = await getCategoryByHandle(params.category)

    const title = product_category.name

    const description = product_category.description ?? `${title} category.`

    return {
      title: getClientSeoTitle(title),
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export async function generateStaticParams() {
  return []
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, q } = searchParams

  const [categories, customer] = await Promise.all([
    listCategories(),
    retrieveCustomer().catch(() => null),
  ])

  const currentCategory = categories.find(
    (category) => category.handle === params.category.join("/")
  )

  if (!currentCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      categories={categories}
      currentCategory={currentCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      customer={customer}
      searchQuery={q}
    />
  )
}
