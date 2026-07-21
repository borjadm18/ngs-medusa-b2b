"use client"

import { useCart } from "@/lib/context/cart-context"
import { getQuoteRequiredCartItems } from "@/lib/util/cart-quote-requirements"
import { getCheckoutStep } from "@/lib/util/get-checkout-step"
import CartLogisticsSummary from "@/modules/cart/components/cart-logistics-summary"
import CartToPdfButton from "@/modules/cart/components/cart-to-pdf-button"
import CartToCsvButton from "@/modules/cart/components/cart-to-csv-button"
import CartTotals from "@/modules/cart/components/cart-totals"
import PromotionCode from "@/modules/checkout/components/promotion-code"
import Button from "@/modules/common/components/button"
import Divider from "@/modules/common/components/divider"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import { B2BCustomer } from "@/types"
import { ApprovalStatusType } from "@/types/approval"
import { ExclamationCircle } from "@medusajs/icons"
import { Container } from "@medusajs/ui"

type SummaryProps = {
  customer: B2BCustomer | null
  canViewPrices: boolean
  spendLimitExceeded: boolean
}

const Summary = ({
  customer,
  canViewPrices,
  spendLimitExceeded,
}: SummaryProps) => {
  const { handleEmptyCart, cart } = useCart()

  if (!cart) return null

  const checkoutStep = getCheckoutStep(cart)
  const checkoutPath = checkoutStep
    ? `/checkout?step=${checkoutStep}`
    : "/checkout"

  const checkoutButtonLink = customer ? checkoutPath : "/account"

  const isPendingApproval = cart?.approvals?.some(
    (approval) => approval?.status === ApprovalStatusType.PENDING
  )
  const quoteRequiredItems = getQuoteRequiredCartItems(cart)
  const requiresQuote = quoteRequiredItems.length > 0
  const companyStatus = customer?.employee?.company?.onboarding_status
  const isOnboardingBlocked = Boolean(customer) && !canViewPrices

  return (
    <Container className="flex flex-col gap-y-3">
      <CartLogisticsSummary />
      {canViewPrices ? (
        <>
          <CartTotals />
          <Divider />
          <PromotionCode cart={cart} />
        </>
      ) : (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
          <p className="font-semibold text-red-950">
            {isOnboardingBlocked
              ? "Cuenta pendiente de aprobación"
              : "Tarifa B2B privada"}
          </p>
          <p>
            {isOnboardingBlocked
              ? companyStatus === "rejected"
                ? "Tu solicitud ha sido rechazada. Contacta con el equipo comercial."
                : "Estamos revisando tu alta B2B. Verás precios, descuentos y checkout cuando sea aprobada."
              : "Inicia sesión para ver subtotales, descuentos, promociones y documentos comerciales."}
          </p>
        </div>
      )}
      <Divider className="my-6" />
      {spendLimitExceeded && (
        <div className="flex items-center gap-x-2 bg-neutral-100 p-3 rounded-md shadow-borders-base">
          <ExclamationCircle className="text-orange-500 w-fit overflow-visible" />
          <p className="text-neutral-950 text-xs">
            Este pedido supera tu límite de gasto.
            <br />
            Solicita aprobación a un responsable de tu empresa.
          </p>
        </div>
      )}
      {requiresQuote && (
        <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
          <p className="font-semibold text-neutral-950">
            Este carrito requiere presupuesto
          </p>
          <p>
            {quoteRequiredItems.length} línea
            {quoteRequiredItems.length === 1 ? "" : "s"} necesita
            {quoteRequiredItems.length === 1 ? "" : "n"} validación comercial
            antes de finalizar compra.
          </p>
        </div>
      )}
      {!requiresQuote && (
        <LocalizedClientLink
          href={checkoutButtonLink}
          data-testid="checkout-button"
        >
          <Button
            className="w-full h-10 rounded-md shadow-none"
            disabled={spendLimitExceeded || isOnboardingBlocked}
          >
            {customer
              ? isOnboardingBlocked
                ? "Pendiente de aprobación"
                : spendLimitExceeded
                ? "Límite de compra superado"
                : "Finalizar compra"
              : "Inicia sesión para comprar"}
          </Button>
        </LocalizedClientLink>
      )}
      {canViewPrices && (
        <RequestQuoteConfirmation>
          <Button
            className="w-full h-10 rounded-md shadow-borders-base"
            variant={requiresQuote ? "primary" : "secondary"}
            disabled={isPendingApproval}
          >
            {requiresQuote ? "Solicitar presupuesto requerido" : "Solicitar presupuesto"}
          </Button>
        </RequestQuoteConfirmation>
      )}
      {!customer && (
        <RequestQuotePrompt>
          <Button
            className="w-full h-10 rounded-md shadow-borders-base"
            variant="secondary"
            disabled={isPendingApproval}
          >
            Solicitar presupuesto
          </Button>
        </RequestQuotePrompt>
      )}
      {canViewPrices && (
        <>
          <CartToCsvButton cart={cart} />
          <CartToPdfButton cart={cart} />
        </>
      )}
      <Button
        onClick={handleEmptyCart}
        className="w-full h-10 rounded-md shadow-borders-base"
        variant="secondary"
        disabled={isPendingApproval}
      >
        Vaciar carrito
      </Button>
    </Container>
  )
}

export default Summary
