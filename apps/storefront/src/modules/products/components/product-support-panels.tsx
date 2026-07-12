import { CubeSolid, HandTruck, ShieldCheck, Wrench } from "@medusajs/icons"
import { ClientProfile } from "@/lib/client-profile"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const defaultPanels = [
  {
    title: "Proyecto a medida",
    body: "Nuestro equipo tecnico puede revisar necesidades, cantidades y compatibilidad.",
    action: "Contactar",
    href: "/account",
    icon: Wrench,
  },
  {
    title: "Envios a toda Europa",
    body: "Entrega rapida y segura para pedidos profesionales.",
    action: "Mas info",
    href: "/store",
    icon: CubeSolid,
  },
  {
    title: "Garantia profesional",
    body: "Soporte comercial y garantia oficial para canal B2B.",
    action: "Mas info",
    href: "/account",
    icon: ShieldCheck,
  },
  {
    title: "Soporte tecnico",
    body: "Asistencia especializada para instalaciones y preventa.",
    action: "Contactar",
    href: "/account",
    icon: HandTruck,
  },
]

const panelIcons = [Wrench, CubeSolid, ShieldCheck, HandTruck]

export function ProductSupportPanels({ profile }: { profile?: ClientProfile }) {
  const panels =
    profile?.productPage?.supportPanels?.slice(0, 4).map((panel, index) => ({
      ...panel,
      href: panel.href || "/account",
      icon: panelIcons[index] || Wrench,
    })) || defaultPanels

  return (
    <section className="content-container grid gap-3 py-8 small:grid-cols-4">
      {panels.map(({ title, body, action, href, icon: Icon }) => (
        <article
          key={title}
          className="rounded-lg border border-neutral-200 bg-white p-5"
        >
          <Icon className="h-7 w-7 text-neutral-950" />
          <h3 className="mt-4 text-sm font-semibold text-neutral-950">
            {title}
          </h3>
          <p className="mt-2 text-xs leading-5 text-neutral-600">{body}</p>
          <LocalizedClientLink
            href={href}
            className="mt-3 inline-flex text-xs font-semibold underline underline-offset-4"
          >
            {action}
          </LocalizedClientLink>
        </article>
      ))}
    </section>
  )
}
