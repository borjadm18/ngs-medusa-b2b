import { retrieveCustomer } from "@/lib/data/customer"
import ApprovedApprovalRequestsAdminList from "@/modules/account/components/approval-requests-admin-list/approved-list"
import PendingApprovalRequestsAdminList from "@/modules/account/components/approval-requests-admin-list/pending-list"
import RejectedApprovalRequestsAdminList from "@/modules/account/components/approval-requests-admin-list/rejected-list"
import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Aprobaciones",
  description: "Resumen de aprobaciones pendientes.",
}

export default async function Approvals({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const urlSearchParams = await searchParams
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer?.employee?.is_admin) {
    return (
      <div className="w-full rounded border border-neutral-200 bg-white p-6">
        <Heading>Aprobaciones</Heading>
        <Text className="mt-2 text-neutral-600">
          Esta seccion esta disponible para administradores de empresa. Puedes
          seguir comprando, solicitando presupuestos y revisando tus pedidos.
        </Text>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-y-4">
      <Heading>Aprobaciones</Heading>

      <Heading level="h2" className="text-neutral-700">
        Pendientes
      </Heading>
      <Suspense fallback={<div>Cargando...</div>}>
        <PendingApprovalRequestsAdminList searchParams={urlSearchParams} />
      </Suspense>

      <Heading level="h2" className="text-neutral-700">
        Aprobadas
      </Heading>
      <Suspense fallback={<div>Cargando...</div>}>
        <ApprovedApprovalRequestsAdminList searchParams={urlSearchParams} />
      </Suspense>

      <Heading level="h2" className="text-neutral-700">
        Rechazadas
      </Heading>
      <Suspense fallback={<div>Cargando...</div>}>
        <RejectedApprovalRequestsAdminList searchParams={urlSearchParams} />
      </Suspense>
    </div>
  )
}
