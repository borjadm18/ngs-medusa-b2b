"use client"

import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import BrandLogo from "@/modules/common/components/brand-logo"
import { BarsThree, ChevronDownMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

const staticLinks = [
  { label: "Soluciones", href: "/store" },
  { label: "Empresa", href: "/account" },
  { label: "Recursos", href: "/store" },
  { label: "Soporte", href: "/account" },
]

export function MobileNavigation({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="medium:hidden">
      <button
        type="button"
        aria-label="Abrir navegación"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded border border-neutral-200 text-neutral-950"
      >
        <BarsThree className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/30">
          <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <BrandLogo className="h-9 w-[140px]" />
              <button
                type="button"
                aria-label="Cerrar navegación"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded border border-neutral-200"
              >
                <XMark className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-5 py-4 text-sm font-semibold text-neutral-950">
              <details className="group border-b border-neutral-200 py-3" open>
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  Productos
                  <ChevronDownMini className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 grid gap-2 text-neutral-600">
                  <LocalizedClientLink href="/store" onClick={() => setOpen(false)}>
                    Ver catálogo completo
                  </LocalizedClientLink>
                  {categories.slice(0, 6).map((category) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/categories/${category.handle}`}
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </LocalizedClientLink>
                  ))}
                </div>
              </details>
              {staticLinks.map((link) => (
                <LocalizedClientLink
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-neutral-200 py-3"
                >
                  {link.label}
                </LocalizedClientLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
