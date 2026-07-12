import { clx } from "@medusajs/ui"
import { clientProfile } from "@/lib/client-profile"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  name?: string
}

const BrandLogo = ({ className, name = clientProfile.brand.name }: BrandLogoProps) => {
  return (
    <span
      className={clx(
        "inline-flex items-center justify-center rounded bg-transparent text-current",
        className
      )}
    >
      <span className="text-[32px] font-semibold leading-none tracking-normal">
        {name}
      </span>
    </span>
  )
}

export default BrandLogo
