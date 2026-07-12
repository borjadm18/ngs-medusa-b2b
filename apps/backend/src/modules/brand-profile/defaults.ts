export type BrandProfileLink = {
  label: string;
  href: string;
};

export type BrandProfileContent = {
  id: string;
  brand: {
    name: string;
    legalName: string;
    tagline: string;
    logo: {
      light: string;
      dark: string;
    };
    colors: {
      background: string;
      foreground: string;
      primary: string;
      accent: string;
      muted: string;
      border: string;
    };
  };
  seo: {
    title: string;
    description: string;
  };
  markets: {
    defaultCountryCode: string;
    languages: string[];
    currency: string;
  };
  navigation: {
    main: BrandProfileLink[];
  };
  footer: {
    description: string;
    columns: Array<{
      title: string;
      links: BrandProfileLink[];
    }>;
  };
  fallbacks: {
    productCategoryLabel: string;
    productTechnicalDescription: string;
    productBrandKeywords: string[];
  };
  productPage?: {
    benefits?: Array<{
      label: string;
    }>;
    supportPanels?: Array<{
      title: string;
      body: string;
      action: string;
      href?: string;
    }>;
  };
};

export const DEFAULT_BRAND_PROFILE_CONTENT: BrandProfileContent = {
  id: "ngs",
  brand: {
    name: "NGS",
    legalName: "NGS Electronics",
    tagline: "Sonido profesional. Negocios que suenan mas alto.",
    logo: {
      light: "/images/ngs/electronics-logo.png",
      dark: "/images/ngs/electronics-logo.png",
    },
    colors: {
      background: "#ffffff",
      foreground: "#111111",
      primary: "#111111",
      accent: "#e30613",
      muted: "#f5f5f5",
      border: "#d9d9d9",
    },
  },
  seo: {
    title: "NGS | Audio profesional B2B",
    description:
      "Portal B2B NGS para comprar altavoces profesionales, accesorios y soluciones de audio con precios por cuenta desde Medusa.",
  },
  markets: {
    defaultCountryCode: "es",
    languages: ["es"],
    currency: "EUR",
  },
  navigation: {
    main: [
      { label: "Productos", href: "/store" },
      { label: "Soluciones", href: "/store" },
      { label: "Empresa", href: "/account/company" },
      { label: "Recursos", href: "/ngs-poc" },
      { label: "Soporte", href: "/account" },
    ],
  },
  footer: {
    description:
      "Soluciones de sonido profesional para empresas e instalaciones que exigen calidad, disponibilidad y fiabilidad.",
    columns: [
      {
        title: "Productos",
        links: [
          { label: "Catalogo completo", href: "/store" },
          { label: "Altavoces activos", href: "/store" },
          { label: "Accesorios", href: "/store" },
        ],
      },
      {
        title: "Operativa B2B",
        links: [
          { label: "Presupuestos", href: "/account/quotes" },
          { label: "Aprobaciones", href: "/account/approvals" },
          { label: "Empresa", href: "/account/company" },
        ],
      },
    ],
  },
  fallbacks: {
    productCategoryLabel: "Producto profesional",
    productTechnicalDescription: "Producto profesional para canal B2B.",
    productBrandKeywords: ["ngs", "audio", "altavoz", "speaker"],
  },
  productPage: {
    benefits: [
      { label: "Precios B2B y descuentos por volumen" },
      { label: "Entrega rapida y fiable" },
      { label: "Soporte tecnico especializado" },
      { label: "Garantia y calidad profesional" },
    ],
    supportPanels: [
      {
        title: "Proyecto a medida",
        body: "Nuestro equipo tecnico puede revisar necesidades, cantidades y compatibilidad.",
        action: "Contactar",
        href: "/account",
      },
      {
        title: "Envios a toda Europa",
        body: "Entrega rapida y segura para pedidos profesionales.",
        action: "Mas info",
        href: "/store",
      },
      {
        title: "Garantia profesional",
        body: "Soporte comercial y garantia oficial para canal B2B.",
        action: "Mas info",
        href: "/account",
      },
      {
        title: "Soporte tecnico",
        body: "Asistencia especializada para instalaciones y preventa.",
        action: "Contactar",
        href: "/account",
      },
    ],
  },
};
