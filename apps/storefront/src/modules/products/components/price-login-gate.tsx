import LocalizedClientLink from "@/modules/common/components/localized-client-link"

export function PriceLoginGate({
  compact = false,
}: {
  compact?: boolean
}) {
  return (
    <div
      className={
        compact
          ? "rounded border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs leading-4 text-neutral-700"
          : "rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-5 text-neutral-700"
      }
      data-testid="price-login-gate"
    >
      <p className="font-semibold text-neutral-950">
        Precio disponible para clientes registrados
      </p>
      <p className={compact ? "mt-0.5" : "mt-1"}>
        Inicia sesion para ver tus tarifas B2B, descuentos y condiciones
        comerciales.
      </p>
      <LocalizedClientLink
        href="/account"
        className="mt-2 inline-flex text-xs font-semibold text-neutral-950 underline underline-offset-4"
      >
        Acceder al portal
      </LocalizedClientLink>
    </div>
  )
}
