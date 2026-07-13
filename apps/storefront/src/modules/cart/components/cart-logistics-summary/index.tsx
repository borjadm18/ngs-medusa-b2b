"use client"

import { useCart } from "@/lib/context/cart-context"
import { getCartPackagingSummary } from "@/lib/util/b2b-packaging"
import { Text } from "@medusajs/ui"

const CartLogisticsSummary = () => {
  const { cart } = useCart()

  if (!cart?.items?.length) {
    return null
  }

  const summary = getCartPackagingSummary(cart.items)
  const hasPackaging =
    summary.boxes > 0 || summary.estimatedWeight > 0 || summary.palletShare > 0

  if (!hasPackaging) {
    return null
  }

  const rows = [
    {
      label: "Bultos",
      value: `${summary.boxes} cajas`,
      show: summary.boxes > 0,
    },
    {
      label: "Unidades",
      value: `${summary.totalUnits} uds`,
      show: summary.totalUnits > 0,
    },
    {
      label: "Peso estimado",
      value: `${summary.estimatedWeight.toFixed(1)} kg`,
      show: summary.estimatedWeight > 0,
    },
    {
      label: "Ocupacion pallet",
      value: `${summary.palletShare.toFixed(2)} pallets`,
      show: summary.palletShare > 0,
    },
  ].filter((row) => row.show)

  return (
    <section className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-normal text-neutral-950">
        Logistica B2B
      </Text>
      <div className="grid gap-1 text-xs text-neutral-700">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span>{row.label}</span>
            <span className="font-medium text-neutral-950">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CartLogisticsSummary
