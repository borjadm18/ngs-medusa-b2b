import ngsProfile from "./profiles/ngs.json"
import ngsHomepage from "./profiles/ngs-homepage.json"

export type ClientProfileLink = {
  label: string
  href: string
}

export type ClientProfile = {
  id: string
  brand: {
    name: string
    legalName: string
    tagline: string
    logo: {
      light: string
      dark: string
    }
    colors: {
      background: string
      foreground: string
      primary: string
      accent: string
      muted: string
      border: string
    }
  }
  seo: {
    title: string
    description: string
  }
  markets: {
    defaultCountryCode: string
    languages: string[]
    currency: string
  }
  navigation: {
    main: ClientProfileLink[]
  }
  footer: {
    description: string
    columns: Array<{
      title: string
      links: ClientProfileLink[]
    }>
  }
  fallbacks: {
    productCategoryLabel: string
    productTechnicalDescription: string
    productBrandKeywords: string[]
  }
}

const profileBundles: Record<
  string,
  {
    profile: ClientProfile
    homepage: Record<string, unknown>
  }
> = {
  ngs: {
    profile: ngsProfile as ClientProfile,
    homepage: ngsHomepage as Record<string, unknown>,
  },
}

export const getClientProfileBundle = () => {
  const activeProfile = process.env.NEXT_PUBLIC_B2B_CLIENT_PROFILE || "ngs"

  return profileBundles[activeProfile] || profileBundles.ngs
}

export const clientProfile = getClientProfileBundle().profile
export const clientHomepageContent = getClientProfileBundle().homepage

export const getClientSeoTitle = (title?: string) => {
  if (!title) {
    return clientProfile.seo.title
  }

  return `${title} | ${clientProfile.brand.name} B2B`
}
