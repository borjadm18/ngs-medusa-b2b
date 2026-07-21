"use server"

import { clientProfile, ClientProfile } from "@/lib/client-profile"
import { sdk } from "@/lib/config"

const removeInternalLinks = (links: ClientProfile["navigation"]["main"]) =>
  links
    .filter((link) => link.enabled !== false && link.href !== "/ngs-poc")
    .map((link) => ({
      ...link,
      children: link.children ? removeInternalLinks(link.children) : undefined,
    }))

const sanitizeBrandProfile = (profile: ClientProfile): ClientProfile => ({
  ...profile,
  navigation: {
    ...profile.navigation,
    main: removeInternalLinks(profile.navigation.main),
  },
  footer: {
    ...profile.footer,
    columns: profile.footer.columns.map((column) => ({
      ...column,
      links: removeInternalLinks(column.links),
    })),
  },
})

export const retrieveBrandProfile = async (): Promise<ClientProfile> => {
  return sdk.client
    .fetch<{ brand_profile: Partial<ClientProfile> }>("/store/brand-profile", {
      method: "GET",
      next: {
        revalidate: 60,
      },
    })
    .then(({ brand_profile }) => {
      const merged: ClientProfile = {
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
        productPage: {
          ...clientProfile.productPage,
          ...brand_profile.productPage,
        },
      }

      return sanitizeBrandProfile(merged)
    })
    .catch(() => sanitizeBrandProfile(clientProfile))
}
