import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { ArrowRight, Envelope } from "@medusajs/icons"
import { Container } from "./container"

export function CommercialCta() {
  return (
    <section className="bg-white py-6 small:py-10">
      <Container>
        <div className="grid gap-5 rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-7 small:grid-cols-[0.38fr_0.42fr_0.2fr] small:items-center">
          <div className="flex items-center gap-5">
            <Envelope className="h-12 w-12 text-neutral-950" />
            <h2 className="text-2xl font-semibold leading-tight text-neutral-950">
              ¿Te ayudamos a encontrar la solución perfecta?
            </h2>
          </div>
          <p className="text-sm leading-6 text-neutral-600">
            Habla con nuestro equipo y recibe asesoramiento personalizado para
            instalaciones, retail, hostelería, empresas y distribución.
          </p>
          <LocalizedClientLink
            href="/account"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-[#d71920]"
          >
            Contactar
            <ArrowRight className="h-4 w-4" />
          </LocalizedClientLink>
        </div>
      </Container>
    </section>
  )
}
