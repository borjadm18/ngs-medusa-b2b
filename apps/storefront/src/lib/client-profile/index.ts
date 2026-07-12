import ngsProfile from "./profiles/ngs.json"

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
}

const profiles: Record<string, ClientProfile> = {
  ngs: ngsProfile as ClientProfile,
}

export const getClientProfile = () => {
  const activeProfile = process.env.NEXT_PUBLIC_B2B_CLIENT_PROFILE || "ngs"

  return profiles[activeProfile] || profiles.ngs
}

export const clientProfile = getClientProfile()

export const getClientSeoTitle = (title?: string) => {
  if (!title) {
    return clientProfile.seo.title
  }

  return `${title} | ${clientProfile.brand.name} B2B`
}
