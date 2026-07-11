import { CubeSolid, HandTruck, ShieldCheck, Wrench } from "@medusajs/icons"

const panels = [
  {
    title: "Proyecto a medida",
    body: "Nuestro equipo tecnico puede revisar necesidades, cantidades y compatibilidad.",
    action: "Contactar",
    icon: Wrench,
  },
  {
    title: "Envios a toda Europa",
    body: "Entrega rapida y segura para pedidos profesionales.",
    action: "Mas info",
    icon: CubeSolid,
  },
  {
    title: "Garantia profesional",
    body: "Soporte comercial y garantia oficial para canal B2B.",
    action: "Mas info",
    icon: ShieldCheck,
  },
  {
    title: "Soporte tecnico",
    body: "Asistencia especializada para instalaciones y preventa.",
    action: "Contactar",
    icon: HandTruck,
  },
]

export function ProductSupportPanels() {
  return (
    <section className="content-container grid gap-3 py-8 small:grid-cols-4">
      {panels.map(({ title, body, action, icon: Icon }) => (
        <article
          key={title}
          className="rounded-lg border border-neutral-200 bg-white p-5"
        >
          <Icon className="h-7 w-7 text-neutral-950" />
          <h3 className="mt-4 text-sm font-semibold text-neutral-950">
            {title}
          </h3>
          <p className="mt-2 text-xs leading-5 text-neutral-600">{body}</p>
          <button className="mt-3 text-xs font-semibold underline underline-offset-4">
            {action}
          </button>
        </article>
      ))}
    </section>
  )
}
