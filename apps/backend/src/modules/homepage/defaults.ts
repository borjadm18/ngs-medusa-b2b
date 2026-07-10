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
  heroBadgePrimary: "Medusa B2B real",
  heroBadgeSecondary: "NGS distribuidores",
  heroTitle: "Portal mayorista NGS para vender mejor al canal profesional.",
  heroBody:
    "Un portal Medusa para cuentas B2B: catalogo conectado al backend, pedidos recurrentes, presupuestos, empleados, limites de compra y pricing por cliente.",
  primaryCtaLabel: "Ver catalogo",
  primaryCtaHref: "/store",
  secondaryCtaLabel: "Area de empresa",
  secondaryCtaHref: "/account",
  heroImage: "/images/ngs/home-hero-speakers.jpg",
  heroImageAlt: "Altavoces NGS en entorno premium",
  heroImageEyebrow: "Imagen de producto para demo comercial",
  heroImageTitle:
    "Una entrada visual mas cercana a una marca de tecnologia que a una plantilla generica.",
  metrics: [
    { value: "8", label: "productos demo desde Medusa" },
    { value: "4", label: "categorias comerciales" },
    { value: "B2B", label: "quotes, empresas y approvals" },
  ],
  trustBlocks: [
    {
      title: "Stock",
      body: "Disponibilidad y lead time desde Medusa",
      image: "",
    },
    { title: "Precios", body: "Tarifas por cliente y grupo", image: "" },
    { title: "Quotes", body: "Negociacion comercial desde carrito", image: "" },
    { title: "Approvals", body: "Flujos por empleado y limite", image: "" },
  ],
  capabilityEyebrow: "Experiencia comercial",
  capabilityTitle: "Visual de marca, datos de Medusa y flujos de compra B2B.",
  capabilityBlocks: [
    {
      title: "Catalogo para canal",
      body: "Rangos NGS organizados para compras por empresa, reposicion y campanas de distribucion.",
      image: "/images/ngs/home-detail-tweeter.jpg",
    },
    {
      title: "Ficha comercial rica",
      body: "Producto, variantes, precio, stock y documentacion listos para integrar con ERP o PIM.",
      image: "/images/ngs/home-detail-brand.jpg",
    },
    {
      title: "Compra recurrente",
      body: "Carrito B2B, presupuestos y aprobaciones para equipos con limites de compra.",
      image: "/images/ngs/home-range-speakers.jpg",
    },
  ],
  categoryEyebrow: "Categorias",
  categoryTitle: "Rangos de producto",
  detailEyebrow: "Detalles de producto",
  detailTitle: "Una demo B2B tambien necesita deseabilidad visual.",
  detailBody:
    "Estas escenas aportan textura, material y tecnologia sin perder el foco operativo: comprar, presupuestar y gestionar cuentas.",
  detailCtaLabel: "Explorar catalogo",
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
  catalogTitle: "Productos reales desde Medusa",
  operationsEyebrow: "Operativa B2B",
  operationsTitle: "Lo que el backoffice aporta a NGS",
  operations: [
    "Empresas, empleados y permisos de compra desde Admin.",
    "Presupuestos negociables que nacen desde el carrito.",
    "Aprobaciones por importe antes de confirmar pedidos.",
    "Base preparada para integrar ERP, PIM, stock e invoices.",
  ],
};
