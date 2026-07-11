export type HomepageMetric = {
  value: string;
  label: string;
};

export type HomepageImageBlock = {
  title: string;
  body: string;
  image: string;
};

export type HomepageContent = {
  heroBadgePrimary: string;
  heroBadgeSecondary: string;
  heroTitle: string;
  heroBody: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroImage: string;
  heroImageAlt: string;
  heroImageEyebrow: string;
  heroImageTitle: string;
  metrics: HomepageMetric[];
  trustBlocks: HomepageImageBlock[];
  capabilityEyebrow: string;
  capabilityTitle: string;
  capabilityBlocks: HomepageImageBlock[];
  categoryEyebrow: string;
  categoryTitle: string;
  detailEyebrow: string;
  detailTitle: string;
  detailBody: string;
  detailCtaLabel: string;
  detailCtaHref: string;
  detailBlocks: HomepageImageBlock[];
  catalogEyebrow: string;
  catalogTitle: string;
  operationsEyebrow: string;
  operationsTitle: string;
  operations: string[];
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroBadgePrimary: "Audio profesional NGS",
  heroBadgeSecondary: "Portal B2B",
  heroTitle: "Sonido profesional. Negocios que suenan mas alto.",
  heroBody:
    "Altavoces disenados para impulsar tu marca, tus proyectos y tus espacios.",
  primaryCtaLabel: "Explorar catalogo",
  primaryCtaHref: "/store",
  secondaryCtaLabel: "Solicitar asesoramiento",
  secondaryCtaHref: "/account",
  heroImage: "/images/ngs/home-hero-ngs-speakers.png",
  heroImageAlt: "Altavoces profesionales NGS en una escena premium",
  heroImageEyebrow: "Gama profesional",
  heroImageTitle:
    "Soluciones de sonido para espacios comerciales y proyectos B2B.",
  metrics: [
    { value: "24/48h", label: "entrega agil segun stock" },
    { value: "B2B", label: "precios por cuenta" },
    { value: "Medusa", label: "catalogo conectado" },
  ],
  trustBlocks: [
    {
      title: "Calidad profesional",
      body: "Rendimiento probado",
      image: "",
    },
    {
      title: "Stock y disponibilidad",
      body: "Entregas agiles y fiables",
      image: "",
    },
    { title: "Precios B2B", body: "Descuentos por volumen", image: "" },
    { title: "Soporte dedicado", body: "Asesoramiento experto", image: "" },
  ],
  capabilityEyebrow: "Soluciones para cada negocio",
  capabilityTitle:
    "Sonido profesional para instalaciones, retail y espacios comerciales.",
  capabilityBlocks: [
    {
      title: "Instalaciones fijas",
      body: "Altavoces y accesorios preparados para espacios donde la fiabilidad importa.",
      image: "/images/ngs/home-detail-tweeter.jpg",
    },
    {
      title: "Eventos y directo",
      body: "Sistemas para proyectos que necesitan potencia, control y montaje rapido.",
      image: "/images/ngs/home-detail-brand.jpg",
    },
    {
      title: "Distribucion B2B",
      body: "Catalogo, precios por cuenta y compras recurrentes conectadas con Medusa.",
      image: "/images/ngs/home-range-speakers.jpg",
    },
  ],
  categoryEyebrow: "Categorias",
  categoryTitle: "Categorias destacadas",
  detailEyebrow: "Soluciones para cada negocio",
  detailTitle: "Soluciones de audio para cada necesidad.",
  detailBody:
    "Desde instalaciones fijas hasta eventos en vivo, tenemos la solucion que tu proyecto necesita.",
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
  catalogEyebrow: "Catalogo conectado",
  catalogTitle: "Productos destacados",
  operationsEyebrow: "Operativa B2B",
  operationsTitle: "Lo que el backoffice aporta a NGS",
  operations: [
    "Empresas, empleados y permisos de compra desde Admin.",
    "Presupuestos negociables que nacen desde el carrito.",
    "Aprobaciones por importe antes de confirmar pedidos.",
    "Base preparada para integrar ERP, PIM, stock e invoices.",
  ],
};
