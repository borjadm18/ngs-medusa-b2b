import { retrieveCart } from "@/lib/data/cart"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import AccountButton from "@/modules/account/components/account-button"
import CartButton from "@/modules/cart/components/cart-button"
import BrandLogo from "@/modules/common/components/brand-logo"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import FilePlus from "@/modules/common/icons/file-plus"
import { MobileNavigation } from "@/modules/layout/components/mobile-navigation"
import { ProductSearchForm } from "@/modules/layout/components/product-search-form"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import SkeletonAccountButton from "@/modules/skeletons/components/skeleton-account-button"
import SkeletonCartButton from "@/modules/skeletons/components/skeleton-cart-button"
import { ChevronDownMini } from "@medusajs/icons"
import { Suspense } from "react"

export async function NavigationHeader() {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart()
  const categories = await listCategories({ limit: 6 }).catch(() => [])

  return (
    <div className="sticky inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/95 text-neutral-950 backdrop-blur">
      <header className="content-container mx-auto flex min-h-[72px] w-full items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <MobileNavigation categories={categories} />
          <div className="flex items-center gap-8">
            <LocalizedClientLink
              className="flex w-fit items-center"
              href="/"
            >
              <BrandLogo className="h-10 w-[156px]" />
            </LocalizedClientLink>

            <nav className="hidden items-center gap-7 text-sm font-semibold medium:flex">
              <div className="group relative">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-1 py-7"
                >
                  Productos
                  <ChevronDownMini className="h-4 w-4" />
                </LocalizedClientLink>
                <div className="invisible absolute left-0 top-full z-50 w-[320px] rounded-lg border border-neutral-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  <LocalizedClientLink
                    href="/store"
                    className="block rounded px-3 py-2 hover:bg-neutral-50"
                  >
                    Ver catálogo completo
                  </LocalizedClientLink>
                  {categories.slice(0, 6).map((category) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/categories/${category.handle}`}
                      className="block rounded px-3 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>
              <LocalizedClientLink href="/store">Soluciones</LocalizedClientLink>
              <LocalizedClientLink href="/store">Sectores</LocalizedClientLink>
              <LocalizedClientLink href="/store">Recursos</LocalizedClientLink>
              <LocalizedClientLink href="/account">Soporte</LocalizedClientLink>
            </nav>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <ProductSearchForm />

          <div className="hidden items-center gap-2 small:flex">
            {customer && cart?.items && cart.items.length > 0 ? (
              <RequestQuoteConfirmation>
                <button
                  className="flex h-10 items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 text-sm font-semibold shadow-none transition hover:bg-neutral-50"
                  // disabled={isPendingApproval}
                >
                  <FilePlus />
                  <span className="hidden small:inline-block">Presupuesto</span>
                </button>
              </RequestQuoteConfirmation>
            ) : (
              <RequestQuotePrompt>
                <button className="flex h-10 items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 text-sm font-semibold shadow-none transition hover:bg-neutral-50">
                  <FilePlus />
                  <span className="hidden small:inline-block">Presupuesto</span>
                </button>
              </RequestQuotePrompt>
            )}
          </div>

          <Suspense fallback={<SkeletonAccountButton />}>
            <AccountButton customer={customer} />
          </Suspense>

          <Suspense fallback={<SkeletonCartButton />}>
            <CartButton />
          </Suspense>
        </div>
      </header>
    </div>
  )
}
