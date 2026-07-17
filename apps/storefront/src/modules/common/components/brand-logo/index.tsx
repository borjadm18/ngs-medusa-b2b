import { clx } from "@medusajs/ui"
import { clientProfile } from "@/lib/client-profile"
import Image from "next/image"

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
  const safeLogoUrl =
    logoUrl && !logoUrl.includes("/asset-files/") ? logoUrl : undefined

  return (
    <span
      className={clx(
        "relative inline-flex items-center justify-center overflow-hidden rounded bg-transparent text-current",
        className
      )}
    >
      {safeLogoUrl ? (
        <Image
          src={safeLogoUrl}
          alt={name}
          fill
          sizes="188px"
          unoptimized
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
