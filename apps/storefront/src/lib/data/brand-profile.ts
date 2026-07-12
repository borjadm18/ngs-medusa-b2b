"use server"

import { clientProfile, ClientProfile } from "@/lib/client-profile"
import { sdk } from "@/lib/config"

export const retrieveBrandProfile = async (): Promise<ClientProfile> => {
  return sdk.client
    .fetch<{ brand_profile: Partial<ClientProfile> }>("/store/brand-profile", {
      method: "GET",
      next: {
        revalidate: 60,
      },
    })
    .then(({ brand_profile }) => ({
      ...clientProfile,
      ...brand_profile,
      brand: {
        ...clientProfile.brand,
        ...brand_profile.brand,
        logo: {
          ...clientProfile.brand.logo,
          ...brand_profile.brand?.logo,
        },
        colors: {
          ...clientProfile.brand.colors,
          ...brand_profile.brand?.colors,
        },
      },
      seo: {
        ...clientProfile.seo,
        ...brand_profile.seo,
      },
      markets: {
        ...clientProfile.markets,
        ...brand_profile.markets,
      },
      navigation: {
        ...clientProfile.navigation,
        ...brand_profile.navigation,
      },
      footer: {
        ...clientProfile.footer,
        ...brand_profile.footer,
      },
      fallbacks: {
        ...clientProfile.fallbacks,
        ...brand_profile.fallbacks,
      },
    }))
    .catch(() => clientProfile)
}
