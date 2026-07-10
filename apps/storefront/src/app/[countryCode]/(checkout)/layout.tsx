import LocalizedClientLink from "@/modules/common/components/localized-client-link"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mb-2 w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
            <span className="text-base font-medium flex items-center">
              <span className="mr-2 inline-flex h-7 w-12 items-center justify-center bg-[#d71920] text-sm font-bold text-white">
                NGS
              </span>
              B2B Portal
            </span>
          </LocalizedClientLink>
        </nav>
      </div>
      <div className="relative bg-neutral-100" data-testid="checkout-container">
        {children}
      </div>
      <div className="flex w-full items-center justify-center py-4 text-sm text-neutral-500">
        NGS B2B Portal. Powered by Medusa.
      </div>
    </div>
  )
}
