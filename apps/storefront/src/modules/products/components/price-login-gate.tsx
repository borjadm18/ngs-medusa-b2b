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
          ? "rounded border border-red-200 bg-red-50 px-2.5 py-2 text-xs leading-4 text-red-800"
          : "rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800"
      }
      data-testid="price-login-gate"
    >
      <p className="font-semibold text-red-950">
        Precio disponible para clientes registrados
      </p>
      <p className={compact ? "mt-0.5" : "mt-1"}>
        Inicia sesion para ver tus tarifas B2B, descuentos y condiciones
        comerciales.
      </p>
      <LocalizedClientLink
        href="/account"
        className="mt-2 inline-flex text-xs font-semibold text-red-900 underline underline-offset-4"
      >
        Acceder al portal
      </LocalizedClientLink>
    </div>
  )
}
