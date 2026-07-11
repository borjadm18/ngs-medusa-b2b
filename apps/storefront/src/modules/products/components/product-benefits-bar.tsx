import { HandTruck, ReceiptPercent, ShieldCheck, Wrench } from "@medusajs/icons"

const benefits = [
  {
    label: "Precios B2B y descuentos por volumen",
    icon: ReceiptPercent,
  },
  {
    label: "Entrega rapida y fiable",
    icon: HandTruck,
  },
  {
    label: "Soporte tecnico especializado",
    icon: Wrench,
  },
  {
    label: "Garantia y calidad profesional",
    icon: ShieldCheck,
  },
]

export function ProductBenefitsBar() {
  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="content-container grid gap-3 py-3 text-xs text-neutral-700 small:grid-cols-4">
        {benefits.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-neutral-950" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
