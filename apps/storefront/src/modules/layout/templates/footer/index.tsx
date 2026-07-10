import { listCategories } from "@/lib/data/categories"
import { listCollections } from "@/lib/data/collections"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Text, clx } from "@medusajs/ui"

export default async function Footer() {
  const { collections } = await listCollections({
    offset: "0",
    limit: "6",
  })
  const product_categories = await listCategories({
    offset: 0,
    limit: 6,
  })

  return (
    <footer className="w-full border-t border-neutral-800 bg-neutral-950 text-neutral-50">
      <div className="content-container flex w-full flex-col">
        <div className="grid gap-8 py-12 small:grid-cols-[1.15fr_1fr]">
          <div>
            <LocalizedClientLink
              href="/"
              className="inline-flex bg-[#d71920] px-4 py-2 text-xl font-bold text-white"
            >
              NGS
            </LocalizedClientLink>
            <p className="mt-5 max-w-md text-sm leading-6 text-neutral-400">
              Portal mayorista para distribuidores y empresas: catalogo,
              precios por cuenta, presupuestos, empleados y aprobaciones.
            </p>
            <div className="mt-6 grid gap-2 text-sm text-neutral-300">
              <span>Atencion comercial B2B</span>
              <span>Stock, ETA y pedidos recurrentes</span>
              <span>Backoffice Medusa en /app del backend</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-small-regular sm:grid-cols-3">
            {product_categories && product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-white">Categorias</span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {product_categories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return null
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li className="flex flex-col gap-2 txt-small" key={c.id}>
                        <LocalizedClientLink
                          className={clx(
                            "text-neutral-400 hover:text-white",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="ml-3 grid grid-cols-1 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="text-neutral-500 hover:text-white"
                                  href={`/categories/${child.handle}`}
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-white">Colecciones</span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-neutral-400 txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-white"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-white">B2B</span>
              <ul className="grid grid-cols-1 gap-y-2 text-neutral-400 txt-small">
                <li>
                  <LocalizedClientLink href="/account" className="hover:text-white">
                    Area de empresa
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/store" className="hover:text-white">
                    Catalogo
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/cart" className="hover:text-white">
                    Carrito
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 flex w-full justify-between border-t border-neutral-800 pt-6">
          <Text className="txt-compact-small text-neutral-500">
            © {new Date().getFullYear()} NGS B2B Portal. Powered by Medusa.
          </Text>
        </div>
      </div>
    </footer>
  )
}
