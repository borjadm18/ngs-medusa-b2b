import { sdk } from "@/lib/config"

export type HomepageMetric = {
  value: string
  label: string
}

export type HomepageImageBlock = {
  title: string
  body: string
  image: string
}

export type HomepageContent = {
  heroBadgePrimary: string
  heroBadgeSecondary: string
  heroTitle: string
  heroBody: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  heroImage: string
  heroImageAlt: string
  heroImageEyebrow: string
  heroImageTitle: string
  metrics: HomepageMetric[]
  trustBlocks: HomepageImageBlock[]
  capabilityEyebrow: string
  capabilityTitle: string
  capabilityBlocks: HomepageImageBlock[]
  categoryEyebrow: string
  categoryTitle: string
  detailEyebrow: string
  detailTitle: string
  detailBody: string
  detailCtaLabel: string
  detailCtaHref: string
  detailBlocks: HomepageImageBlock[]
  catalogEyebrow: string
  catalogTitle: string
  operationsEyebrow: string
  operationsTitle: string
  operations: string[]
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroBadgePrimary: "Audio profesional NGS",
  heroBadgeSecondary: "Portal B2B",
  heroTitle: "Sonido profesional. Negocios que suenan más alto.",
  heroBody:
    "Altavoces diseñados para impulsar tu marca, tus proyectos y tus espacios.",
  primaryCtaLabel: "Explorar catálogo",
  primaryCtaHref: "/store",
  secondaryCtaLabel: "Solicitar asesoramiento",
  secondaryCtaHref: "/account",
  heroImage: "/images/ngs/home-hero-speakers.jpg",
  heroImageAlt: "Altavoces profesionales NGS en una escena premium",
  heroImageEyebrow: "Gama profesional",
  heroImageTitle: "Soluciones de sonido para espacios comerciales y proyectos B2B.",
  metrics: [
    { value: "24/48h", label: "entrega ágil según stock" },
    { value: "B2B", label: "precios por cuenta" },
    { value: "Medusa", label: "catálogo conectado" },
  ],
  trustBlocks: [
    {
      title: "Calidad profesional",
      body: "Rendimiento probado",
      image: "",
    },
    { title: "Stock y disponibilidad", body: "Entregas ágiles y fiables", image: "" },
    { title: "Precios B2B", body: "Descuentos por volumen", image: "" },
    { title: "Soporte dedicado", body: "Asesoramiento experto", image: "" },
  ],
  capabilityEyebrow: "Soluciones para cada negocio",
  capabilityTitle: "Sonido profesional para instalaciones, retail y espacios comerciales.",
  capabilityBlocks: [
    {
      title: "Instalaciones fijas",
      body: "Altavoces y accesorios preparados para espacios donde la fiabilidad importa.",
      image: "/images/ngs/home-detail-tweeter.jpg",
    },
    {
      title: "Eventos y directo",
      body: "Sistemas para proyectos que necesitan potencia, control y montaje rápido.",
      image: "/images/ngs/home-detail-brand.jpg",
    },
    {
      title: "Distribución B2B",
      body: "Catálogo, precios por cuenta y compras recurrentes conectadas con Medusa.",
      image: "/images/ngs/home-range-speakers.jpg",
    },
  ],
  categoryEyebrow: "Categorías",
  categoryTitle: "Categorías destacadas",
  detailEyebrow: "Soluciones para cada negocio",
  detailTitle: "Soluciones de audio para cada necesidad.",
  detailBody:
    "Desde instalaciones fijas hasta eventos en vivo, tenemos la solución que tu proyecto necesita.",
  detailCtaLabel: "Descubrir soluciones",
  detailCtaHref: "/store",
  detailBlocks: [
    {
      title: "Materiales y acabado",
      body: "Una presentacion mas cuidada para gamas premium, bundles y lineales de distribucion.",
      image: "/images/ngs/home-texture-wood.jpg",
    },
    {
      title: "Conectividad",
      body: "Accesorios, cables y componentes como parte del surtido B2B ampliado.",
      image: "/images/ngs/home-detail-cable.jpg",
    },
    {
      title: "Texturas de producto",
      body: "Detalle visual para reforzar calidad percibida sin convertir el portal en una landing B2C.",
      image: "/images/ngs/home-texture-fabric.jpg",
    },
    {
      title: "Entorno profesional",
      body: "Una direccion visual tecnologica que acompana al catalogo y al backoffice Medusa.",
      image: "/images/ngs/home-panel-acoustic.jpg",
    },
  ],
  catalogEyebrow: "Catálogo conectado",
  catalogTitle: "Productos destacados",
  operationsEyebrow: "Operativa B2B",
  operationsTitle: "Lo que el backoffice aporta a NGS",
  operations: [
    "Empresas, empleados y permisos de compra desde Admin.",
    "Presupuestos negociables que nacen desde el carrito.",
    "Aprobaciones por importe antes de confirmar pedidos.",
    "Base preparada para integrar ERP, PIM, stock e invoices.",
  ],
}

export const getHomepageContent = async (): Promise<HomepageContent> => {
  return sdk.client
    .fetch<{ homepage: HomepageContent }>("/store/homepage", {
      method: "GET",
      next: {
        revalidate: 60,
      },
    })
    .then(({ homepage }) => {
      const isLegacyBackendDefault =
        homepage.heroBadgePrimary === "Medusa B2B real" ||
        homepage.heroTitle ===
          "Portal mayorista NGS para vender mejor al canal profesional."

      if (isLegacyBackendDefault) {
        return DEFAULT_HOMEPAGE_CONTENT
      }

      return {
        ...DEFAULT_HOMEPAGE_CONTENT,
        ...homepage,
      }
    })
    .catch(() => DEFAULT_HOMEPAGE_CONTENT)
}
