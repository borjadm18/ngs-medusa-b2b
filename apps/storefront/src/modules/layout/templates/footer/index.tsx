import { listCategories } from "@/lib/data/categories"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const footerGroups = [
  {
    title: "Soluciones",
    links: [
      ["Instalaciones fijas", "/store"],
      ["Eventos en vivo", "/store"],
      ["Retail", "/store"],
      ["Hostelería", "/store"],
      ["Empresas", "/store"],
      ["Ver todas las soluciones", "/store"],
    ],
  },
  {
    title: "Recursos",
    links: [
      ["Documentación", "/store"],
      ["Especificaciones", "/store"],
      ["Catálogos", "/store"],
      ["Casos de éxito", "/store"],
      ["Blog", "/store"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Sobre NGS", "/account"],
      ["Calidad", "/account"],
      ["Sostenibilidad", "/account"],
      ["Trabaja con nosotros", "/account"],
      ["Contacto", "/account"],
    ],
  },
  {
    title: "Soporte",
    links: [
      ["Centro de ayuda", "/account"],
      ["Garantías", "/account"],
      ["Devoluciones", "/account"],
      ["Estado de pedidos", "/account"],
    ],
  },
]

export default async function Footer() {
  const categories = await listCategories({
    offset: 0,
    limit: 5,
  }).catch(() => [])

  const productLinks =
    categories.length > 0
      ? categories
          .filter((category) => !category.parent_category)
          .slice(0, 5)
          .map((category) => [category.name, `/categories/${category.handle}`])
      : [
          ["Altavoces pasivos", "/store"],
          ["Altavoces activos", "/store"],
          ["Subwoofers", "/store"],
          ["Columnas", "/store"],
          ["Accesorios", "/store"],
        ]

  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-950">
      <div className="content-container mx-auto w-full">
        <div className="grid gap-10 py-10 small:grid-cols-[1.35fr_3fr]">
          <div>
            <LocalizedClientLink
              href="/"
              className="text-[32px] font-semibold leading-none"
            >
              NGS
            </LocalizedClientLink>
            <p className="mt-5 max-w-xs text-sm leading-6 text-neutral-600">
              Soluciones de sonido profesional diseñadas para negocios que
              buscan la máxima calidad.
            </p>
            <div className="mt-6 flex gap-3 text-xs font-semibold text-neutral-600">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-neutral-200">
                in
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-neutral-200">
                ig
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-neutral-200">
                yt
              </span>
            </div>
          </div>

          <div className="grid gap-8 xsmall:grid-cols-2 medium:grid-cols-5">
            <div>
              <h3 className="text-sm font-semibold">Productos</h3>
              <ul className="mt-4 grid gap-2 text-sm text-neutral-600">
                {productLinks.map(([label, href]) => (
                  <li key={label}>
                    <LocalizedClientLink
                      href={href}
                      className="transition hover:text-neutral-950"
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="transition hover:text-neutral-950"
                  >
                    Ver catálogo completo
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <ul className="mt-4 grid gap-2 text-sm text-neutral-600">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <LocalizedClientLink
                        href={href}
                        className="transition hover:text-neutral-950"
                      >
                        {label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-200 py-6 text-xs text-neutral-500 small:flex-row small:items-center small:justify-between">
          <p>© {new Date().getFullYear()} NGS. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <LocalizedClientLink href="/store">Términos y condiciones</LocalizedClientLink>
            <LocalizedClientLink href="/store">Política de privacidad</LocalizedClientLink>
            <LocalizedClientLink href="/store">Cookies</LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
