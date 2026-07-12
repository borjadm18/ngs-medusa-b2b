import { clx } from "@medusajs/ui"
import { clientProfile } from "@/lib/client-profile"
import Image from "next/image"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
}

const BrandLogo = ({ className, imageClassName }: BrandLogoProps) => {
  return (
    <span
      className={clx(
        "inline-flex items-center overflow-hidden rounded bg-neutral-950",
        className
      )}
    >
      <Image
        src={clientProfile.brand.logo.dark || clientProfile.brand.logo.light}
        alt={clientProfile.brand.legalName || clientProfile.brand.name}
        width={1060}
        height={340}
        priority
        className={clx("h-full w-full object-cover", imageClassName)}
      />
    </span>
  )
}

export default BrandLogo
