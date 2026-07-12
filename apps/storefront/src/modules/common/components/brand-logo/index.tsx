import { clx } from "@medusajs/ui"
import { clientProfile } from "@/lib/client-profile"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
}

const BrandLogo = ({ className }: BrandLogoProps) => {
  return (
    <span
      className={clx(
        "inline-flex items-center justify-center rounded bg-transparent text-current",
        className
      )}
    >
      <span className="text-[32px] font-semibold leading-none tracking-normal">
        {clientProfile.brand.name}
      </span>
    </span>
  )
}

export default BrandLogo
