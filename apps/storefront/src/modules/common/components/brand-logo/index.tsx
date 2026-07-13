import { clx } from "@medusajs/ui"
import { clientProfile } from "@/lib/client-profile"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  name?: string
  logoUrl?: string
}

const BrandLogo = ({
  className,
  imageClassName,
  name = clientProfile.brand.name,
  logoUrl,
}: BrandLogoProps) => {
  return (
    <span
      className={clx(
        "inline-flex items-center justify-center overflow-hidden rounded bg-transparent text-current",
        className
      )}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className={clx("h-full w-full object-contain", imageClassName)}
        />
      ) : (
        <span className="text-[32px] font-semibold leading-none tracking-normal">
          {name}
        </span>
      )}
    </span>
  )
}

export default BrandLogo
