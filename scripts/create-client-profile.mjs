import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"

const rootDir = process.cwd()
const profilesDir = path.join(rootDir, "profiles")
const templatesDir = path.join(rootDir, "templates")

const usage = `Usage:
  pnpm create:client-profile -- --id <cliente> --name "Cliente"
  pnpm create:client-profile -- --id acme --name "ACME" --from ngs --accent "#d71920"

Options:
  --id       Perfil slug en kebab-case. Ej: ngs, acme-industrial
  --name     Nombre comercial visible. Ej: "ACME Industrial"
  --legal    Nombre legal opcional
  --tagline  Tagline visible opcional
  --from     Perfil base existente en ./profiles o "template". Por defecto: template
  --vertical Vertical pack: audio, packaging, hardware, electrical, spare-parts
  --accent   Color acento hex. Ej: "#d71920"
  --country  Pais por defecto. Por defecto: es
  --currency Moneda. Por defecto: EUR
  --force    Permite sobrescribir archivos existentes del perfil
  --no-sync  Crea archivos sin ejecutar sync-client-profile
  --dry-run  Muestra lo que se crearia sin escribir archivos
`

const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {
    force: false,
    sync: true,
    dryRun: false,
    from: "template",
    vertical: "industrial",
    country: "es",
    currency: "EUR",
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === "--") {
      continue
    }

    if (arg === "--force") {
      options.force = true
      continue
    }

    if (arg === "--no-sync") {
      options.sync = false
      continue
    }

    if (arg === "--dry-run") {
      options.dryRun = true
      continue
    }

    if (
      arg === "--id" ||
      arg === "--name" ||
      arg === "--legal" ||
      arg === "--tagline" ||
      arg === "--from" ||
      arg === "--vertical" ||
      arg === "--accent" ||
      arg === "--country" ||
      arg === "--currency"
    ) {
      options[arg.slice(2)] = args[index + 1]
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}\n\n${usage}`)
  }

  return options
}

const assertValidId = (profileId) => {
  if (!profileId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileId)) {
    throw new Error(
      "--id must be kebab-case with lowercase letters, numbers and hyphens"
    )
  }
}

const assertHexColor = (color, label) => {
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new Error(`${label} must be a hex color like #d71920`)
  }
}

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"))

const writeJson = (filePath, data, force) => {
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`${path.relative(rootDir, filePath)} already exists. Use --force to overwrite.`)
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

const copyFile = (sourcePath, targetPath, force) => {
  if (fs.existsSync(targetPath) && !force) {
    throw new Error(`${path.relative(rootDir, targetPath)} already exists. Use --force to overwrite.`)
  }

  fs.copyFileSync(sourcePath, targetPath)
}

const writeJsonMaybe = (filePath, data, force, dryRun) => {
  if (dryRun) {
    console.log(`[dry-run] write ${path.relative(rootDir, filePath)}`)
    return
  }

  writeJson(filePath, data, force)
}

const copyFileMaybe = (sourcePath, targetPath, force, dryRun) => {
  if (dryRun) {
    console.log(
      `[dry-run] copy ${path.relative(rootDir, sourcePath)} -> ${path.relative(
        rootDir,
        targetPath
      )}`
    )
    return
  }

  copyFile(sourcePath, targetPath, force)
}

const writeTextMaybe = (filePath, content, force, dryRun) => {
  if (dryRun) {
    console.log(`[dry-run] write ${path.relative(rootDir, filePath)}`)
    return
  }

  if (fs.existsSync(filePath) && !force) {
    throw new Error(`${path.relative(rootDir, filePath)} already exists. Use --force to overwrite.`)
  }

  fs.writeFileSync(filePath, content, "utf8")
}

const replaceClientImagePath = (value, profileId) => {
  if (typeof value !== "string") {
    return value
  }

  return value.replaceAll("/images/client/", `/images/${profileId}/`)
}

const mapDeep = (value, mapper) => {
  if (Array.isArray(value)) {
    return value.map((item) => mapDeep(item, mapper))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapDeep(item, mapper)])
    )
  }

  return mapper(value)
}

const titleCaseFromId = (profileId) =>
  profileId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const verticalPacks = {
  industrial: {
    tagline: "Suministro profesional para empresas",
    categoryLabel: "Producto profesional",
    keywords: ["industrial", "profesional", "b2b"],
    heroTitle: (brandName) =>
      `Compra profesional ${brandName} con reglas reales de empresa.`,
    heroBody:
      "Catalogo, packaging, presupuestos y aprobaciones en una experiencia preparada para operaciones B2B.",
    categories: [
      "Consumibles",
      "Repuestos",
      "Herramientas",
      "Proteccion",
      "Accesorios",
    ],
    solutions: [
      "Compras recurrentes",
      "Packaging industrial",
      "Presupuestos y aprobaciones",
    ],
    capabilityTitle:
      "Un portal preparado para compras recurrentes, stock y control comercial.",
    packagingRows: null,
  },
  audio: {
    tagline: "Audio profesional para negocios, instalaciones y eventos.",
    categoryLabel: "Equipo de audio profesional",
    keywords: ["audio", "altavoz", "sonido", "instalacion"],
    heroTitle: (brandName) =>
      `Sonido profesional ${brandName} para negocios que suenan mas alto.`,
    heroBody:
      "Altavoces, accesorios y soluciones de audio con precios B2B, compra por caja y soporte comercial.",
    categories: [
      "Altavoces activos",
      "Altavoces pasivos",
      "Subwoofers",
      "Columnas",
      "Accesorios",
    ],
    solutions: ["Instalaciones fijas", "Eventos en vivo", "Retail y hosteleria"],
    capabilityTitle:
      "Soluciones de audio para venta recurrente, proyectos e instalaciones.",
    packagingRows: [
      ["SKU-AUDIO-ACTIVO-12-BLK", "", "box", 6, 6, 6, 32, 8.2, "560 x 380 x 360 mm"],
      ["SKU-AUDIO-SUB-18-BLK", "", "box", 2, 2, 2, 12, 28.5, "720 x 560 x 520 mm"],
      ["SKU-AUDIO-COLUMN-10-BLK", "", "unit", 1, 1, 1, 18, 14.8, "1040 x 260 x 240 mm"],
      ["SKU-AUDIO-CABLE-XLR-5M", "", "box", 24, 24, 24, 80, 4.2, "430 x 300 x 250 mm"],
    ],
  },
  packaging: {
    tagline: "Embalaje y packaging para operaciones que no pueden parar.",
    categoryLabel: "Producto de packaging profesional",
    keywords: ["packaging", "embalaje", "caja", "sobre"],
    heroTitle: (brandName) =>
      `Packaging ${brandName} preparado para compras B2B por caja y pallet.`,
    heroBody:
      "Sobres, cajas, proteccion y consumibles con minimos, multiplos, pallets y presupuestos para equipos de compra.",
    categories: ["Cajas", "Sobres", "Proteccion", "Etiquetas", "Precintos"],
    solutions: ["Ecommerce", "Logistica", "Almacen", "Retail"],
    capabilityTitle:
      "Un portal para comprar embalaje con control de stock, volumen y logistica.",
    packagingRows: [
      ["SKU-BOX-KRAFT-300", "", "box", 100, 100, 100, 40, 12.5, "600 x 400 x 360 mm"],
      ["SKU-MAILER-BAG-250", "", "box", 250, 250, 250, 32, 8.1, "520 x 380 x 300 mm"],
      ["SKU-BUBBLE-ROLL-50M", "", "unit", 1, 1, 1, 24, 3.8, "500 x 500 x 1000 mm"],
      ["SKU-LABEL-A6-1000", "", "box", 1000, 1000, 1000, 60, 6.4, "320 x 240 x 220 mm"],
      ["SKU-TAPE-48MM-36", "", "box", 36, 36, 36, 72, 9.6, "420 x 320 x 280 mm"],
    ],
  },
  hardware: {
    tagline: "Ferreteria industrial para compras recurrentes y mantenimiento.",
    categoryLabel: "Producto de ferreteria industrial",
    keywords: ["ferreteria", "herramienta", "mantenimiento", "suministro"],
    heroTitle: (brandName) =>
      `Ferreteria industrial ${brandName} con control B2B real.`,
    heroBody:
      "Herramientas, consumibles y EPIs con tarifas por cuenta, aprobaciones y compra recurrente.",
    categories: ["Herramientas", "Fijaciones", "EPIs", "Consumibles", "Adhesivos"],
    solutions: ["Mantenimiento", "Obra", "Taller", "Compras corporativas"],
    capabilityTitle:
      "Compra recurrente para equipos de mantenimiento, obra y operaciones.",
    packagingRows: [
      ["SKU-ANCHOR-M8-100", "", "box", 100, 100, 100, 60, 5.2, "260 x 180 x 120 mm"],
      ["SKU-GLOVE-NITRILE-L", "", "box", 10, 10, 10, 80, 4.5, "420 x 300 x 260 mm"],
      ["SKU-DRILL-BIT-SET", "", "box", 6, 6, 6, 72, 3.6, "300 x 220 x 160 mm"],
      ["SKU-ADHESIVE-290ML", "", "box", 12, 12, 12, 48, 7.8, "340 x 260 x 240 mm"],
    ],
  },
  electrical: {
    tagline: "Material electrico para instaladores, distribuidores y empresas.",
    categoryLabel: "Material electrico profesional",
    keywords: ["material electrico", "instalacion", "cable", "cuadro"],
    heroTitle: (brandName) =>
      `Material electrico ${brandName} para instalaciones profesionales.`,
    heroBody:
      "Cableado, proteccion, mecanismos y accesorios con reglas por cuenta, region y canal.",
    categories: ["Cableado", "Proteccion", "Mecanismos", "Iluminacion", "Canalizacion"],
    solutions: ["Instaladores", "Distribucion", "Mantenimiento", "Proyectos"],
    capabilityTitle:
      "Un portal preparado para instaladores, distribuidores y compras por proyecto.",
    packagingRows: [
      ["SKU-CABLE-3G25-100M", "", "unit", 1, 1, 1, 12, 24.0, "620 x 620 x 220 mm"],
      ["SKU-BREAKER-C16-12", "", "box", 12, 12, 12, 80, 3.2, "280 x 180 x 160 mm"],
      ["SKU-SWITCH-WHITE-24", "", "box", 24, 24, 24, 96, 4.8, "360 x 260 x 220 mm"],
      ["SKU-LED-PANEL-60X60", "", "box", 4, 4, 4, 30, 10.4, "680 x 680 x 180 mm"],
    ],
  },
  "spare-parts": {
    tagline: "Repuestos industriales para reducir paradas y acelerar compras.",
    categoryLabel: "Repuesto industrial",
    keywords: ["repuesto", "maquinaria", "mantenimiento", "industrial"],
    heroTitle: (brandName) =>
      `Repuestos ${brandName} para operaciones que necesitan continuidad.`,
    heroBody:
      "Piezas, consumibles y equivalencias con busqueda por SKU, presupuestos y reglas por cliente.",
    categories: ["Repuestos", "Consumibles", "Filtros", "Rodamientos", "Accesorios"],
    solutions: ["Mantenimiento", "Reposicion", "Maquinaria", "Compras urgentes"],
    capabilityTitle:
      "Compra de repuestos con control comercial, equivalencias y logistica.",
    packagingRows: [
      ["SKU-BEARING-6205-20", "", "box", 20, 20, 20, 100, 3.4, "220 x 160 x 120 mm"],
      ["SKU-FILTER-HYD-12", "", "box", 12, 12, 12, 48, 6.8, "420 x 320 x 260 mm"],
      ["SKU-BELT-A42-10", "", "box", 10, 10, 10, 60, 4.1, "500 x 300 x 180 mm"],
      ["SKU-SENSOR-PROX-5", "", "box", 5, 5, 5, 80, 2.2, "260 x 180 x 140 mm"],
    ],
  },
}

const assertValidVertical = (vertical) => {
  if (!verticalPacks[vertical]) {
    throw new Error(
      `--vertical must be one of: ${Object.keys(verticalPacks).join(", ")}`
    )
  }
}

const resolveProfileSource = (from) => {
  if (!from || from === "template") {
    return {
      profilePath: path.join(templatesDir, "client-profile.example.json"),
      homepagePath: path.join(templatesDir, "homepage-content.example.json"),
      packagingPath: path.join(templatesDir, "product-packaging.example.csv"),
      assetsDir: null,
    }
  }

  assertValidId(from)

  const sourceDir = path.join(profilesDir, from)
  const profilePath = path.join(sourceDir, "client-profile.json")
  const homepagePath = path.join(sourceDir, "homepage-content.json")
  const packagingPath = path.join(sourceDir, "product-packaging.csv")

  if (!fs.existsSync(profilePath) || !fs.existsSync(homepagePath)) {
    throw new Error(`profiles/${from} is missing client-profile.json or homepage-content.json`)
  }

  return {
    profilePath,
    homepagePath,
    packagingPath: fs.existsSync(packagingPath)
      ? packagingPath
      : path.join(templatesDir, "product-packaging.example.csv"),
    assetsDir: path.join(sourceDir, "assets"),
  }
}

const makeMenuChildren = (labels) =>
  labels.map((label) => ({
    label,
    href: "/store",
    enabled: true,
  }))

const packagingHeaders = [
  "sku",
  "variant_id",
  "sales_unit",
  "minimum_order_quantity",
  "quantity_increment",
  "units_per_box",
  "boxes_per_pallet",
  "package_weight",
  "package_dimensions",
]

const productCatalogHeaders = [
  "handle",
  "title",
  "category",
  "description",
  "sku",
  "variant_title",
  "color",
  "price_eur",
  "image_url",
]

const productCatalogSamples = {
  industrial: [
    ["consumible-industrial-pro", "Consumible industrial PRO", "Consumibles", "Producto de reposicion profesional para compras recurrentes.", "SKU-IND-CONS-PRO", "Caja estandar", "Black", 19.9, ""],
    ["repuesto-mantenimiento-24", "Repuesto mantenimiento 24", "Repuestos", "Repuesto critico para equipos de mantenimiento y operaciones.", "SKU-IND-REP-24", "Pack profesional", "Grey", 49.9, ""],
    ["herramienta-servicio-plus", "Herramienta servicio PLUS", "Herramientas", "Herramienta para equipos tecnicos con compra por volumen.", "SKU-IND-TOOL-PLUS", "Unidad", "Black", 89.9, ""],
    ["proteccion-operario-lite", "Proteccion operario LITE", "Proteccion", "Producto de proteccion para operaciones con alta rotacion.", "SKU-IND-PPE-LITE", "Caja", "White", 12.9, ""],
  ],
  audio: [
    ["altavoz-activo-12", "Altavoz activo 12 pulgadas", "Altavoces activos", "Altavoz profesional para instalaciones, eventos y retail.", "SKU-AUDIO-ACTIVO-12-BLK", "Black", "Black", 549, ""],
    ["subwoofer-activo-18", "Subwoofer activo 18 pulgadas", "Subwoofers", "Subwoofer profesional para refuerzo de graves en proyectos.", "SKU-AUDIO-SUB-18-BLK", "Black", "Black", 749, ""],
    ["columna-line-array-10", "Columna line array 10", "Columnas", "Sistema compacto para eventos, hosteleria y salas.", "SKU-AUDIO-COLUMN-10-BLK", "Black", "Black", 899, ""],
    ["cable-xlr-5m", "Cable XLR profesional 5m", "Accesorios", "Accesorio de alta rotacion para venta por caja.", "SKU-AUDIO-CABLE-XLR-5M", "Caja 24 uds", "Black", 9.9, ""],
  ],
  packaging: [
    ["caja-kraft-300", "Caja kraft 300", "Cajas", "Caja de carton para ecommerce y logistica B2B.", "SKU-BOX-KRAFT-300", "Caja 100 uds", "Kraft", 42.5, ""],
    ["sobre-mailer-250", "Sobre mailer 250", "Sobres", "Sobre profesional para envios ecommerce por volumen.", "SKU-MAILER-BAG-250", "Caja 250 uds", "Kraft", 52.95, ""],
    ["rollo-burbuja-50m", "Rollo burbuja 50m", "Proteccion", "Proteccion para embalaje y expediciones recurrentes.", "SKU-BUBBLE-ROLL-50M", "Rollo", "Transparent", 18.5, ""],
    ["etiqueta-a6-1000", "Etiqueta A6 1000", "Etiquetas", "Etiqueta termica para almacenes y ecommerce.", "SKU-LABEL-A6-1000", "Caja 1000 uds", "White", 24.95, ""],
    ["precinto-48mm-36", "Precinto 48mm caja 36", "Precintos", "Precinto profesional para operativa diaria de almacen.", "SKU-TAPE-48MM-36", "Caja 36 uds", "Transparent", 31.2, ""],
  ],
  hardware: [
    ["anclaje-m8-100", "Anclaje M8 caja 100", "Fijaciones", "Fijacion profesional para obra, instalacion y mantenimiento.", "SKU-ANCHOR-M8-100", "Caja 100 uds", "Steel", 16.9, ""],
    ["guante-nitrilo-l", "Guante nitrilo talla L", "EPIs", "Guante profesional para consumo recurrente.", "SKU-GLOVE-NITRILE-L", "Caja 10 packs", "Blue", 12.4, ""],
    ["set-brocas-industrial", "Set brocas industrial", "Herramientas", "Set para taller y equipos de mantenimiento.", "SKU-DRILL-BIT-SET", "Caja 6 sets", "Black", 34.9, ""],
    ["adhesivo-290ml", "Adhesivo profesional 290ml", "Adhesivos", "Consumible industrial para aplicaciones recurrentes.", "SKU-ADHESIVE-290ML", "Caja 12 uds", "White", 7.8, ""],
  ],
  electrical: [
    ["cable-3g25-100m", "Cable 3G2.5 rollo 100m", "Cableado", "Cable electrico para instaladores y proyectos.", "SKU-CABLE-3G25-100M", "Rollo", "Black", 129, ""],
    ["magnetotermico-c16-12", "Magnetotermico C16 caja 12", "Proteccion", "Proteccion electrica para instalacion profesional.", "SKU-BREAKER-C16-12", "Caja 12 uds", "White", 8.9, ""],
    ["interruptor-blanco-24", "Interruptor blanco caja 24", "Mecanismos", "Mecanismo para instaladores y reposicion.", "SKU-SWITCH-WHITE-24", "Caja 24 uds", "White", 5.4, ""],
    ["panel-led-60x60", "Panel LED 60x60", "Iluminacion", "Panel para proyectos, oficinas y retail.", "SKU-LED-PANEL-60X60", "Caja 4 uds", "White", 39.9, ""],
  ],
  "spare-parts": [
    ["rodamiento-6205-20", "Rodamiento 6205 caja 20", "Rodamientos", "Repuesto recurrente para mantenimiento industrial.", "SKU-BEARING-6205-20", "Caja 20 uds", "Steel", 6.9, ""],
    ["filtro-hidraulico-12", "Filtro hidraulico caja 12", "Filtros", "Filtro para mantenimiento preventivo y reposicion.", "SKU-FILTER-HYD-12", "Caja 12 uds", "White", 18.9, ""],
    ["correa-a42-10", "Correa A42 caja 10", "Repuestos", "Correa industrial para equipos y maquinaria.", "SKU-BELT-A42-10", "Caja 10 uds", "Black", 11.5, ""],
    ["sensor-proximidad-5", "Sensor proximidad caja 5", "Accesorios", "Sensor para recambios tecnicos y proyectos.", "SKU-SENSOR-PROX-5", "Caja 5 uds", "Black", 24.5, ""],
  ],
}

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "")

  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

const buildVerticalPackagingCsv = (vertical) => {
  const rows = verticalPacks[vertical]?.packagingRows

  if (!rows?.length) {
    return null
  }

  return [
    packagingHeaders.join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n") + "\n"
}

const buildVerticalProductCatalogCsv = (vertical, brandName) => {
  const rows = productCatalogSamples[vertical]

  if (!rows?.length) {
    return null
  }

  return [
    productCatalogHeaders.join(","),
    ...rows.map((row) =>
      row
        .map((value, index) =>
          escapeCsvValue(index === 1 ? `${brandName} ${value}` : value)
        )
        .join(",")
    ),
  ].join("\n") + "\n"
}

const applyVerticalPack = ({ profile, homepage, brandName, vertical }) => {
  const pack = verticalPacks[vertical]

  profile.brand.tagline = profile.brand.tagline || pack.tagline
  profile.fallbacks.productCategoryLabel = pack.categoryLabel
  profile.fallbacks.productTechnicalDescription = `${pack.categoryLabel} para canal B2B.`
  profile.fallbacks.productBrandKeywords = pack.keywords

  const productLink = profile.navigation.main.find(
    (link) => link.label === "Productos"
  )
  const solutionsLink = profile.navigation.main.find(
    (link) => link.label === "Soluciones"
  )

  if (productLink) {
    productLink.enabled = true
    productLink.children = [
      { label: "Catalogo completo", href: "/store", enabled: true },
      ...makeMenuChildren(pack.categories),
    ]
  }

  if (solutionsLink) {
    solutionsLink.enabled = true
    solutionsLink.children = makeMenuChildren(pack.solutions)
  }

  homepage.heroTitle = pack.heroTitle(brandName)
  homepage.heroBody = pack.heroBody
  homepage.capabilityTitle = pack.capabilityTitle
  homepage.featuredCategories = (homepage.featuredCategories || []).map(
    (category, index) => ({
      ...category,
      title: pack.categories[index] || category.title,
      handle: (pack.categories[index] || category.title)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    })
  )
}

const stripDemoOnlyLinks = (links) => {
  if (!Array.isArray(links)) {
    return
  }

  links.forEach((link) => {
    if (link.href === "/ngs-poc") {
      link.href = "/store"
    }

    stripDemoOnlyLinks(link.children)
  })
}

const buildActivationChecklist = ({
  id,
  brandName,
  from,
  country,
  currency,
}) => `# Activacion ${brandName}

Checklist para convertir este perfil en una demo B2B funcional.

## 1. Revisar perfil

- [ ] \`client-profile.json\`: marca, SEO, colores, logo, menu, footer y fallbacks.
- [ ] \`homepage-content.json\`: hero, categorias, bloques visuales, CTAs y productos destacados.
- [ ] \`product-catalog.csv\`: productos, categorias, variantes, precios base e imagenes.
- [ ] \`product-packaging.csv\`: SKUs reales, unidades/caja, minimos, multiplos, pallets y peso.
- [ ] \`assets/\`: logos e imagenes con rutas \`/images/${id}/...\`.

## 2. Sincronizar artefactos

\`\`\`bash
pnpm sync:client-profile
\`\`\`

## 3. Activar storefront local

\`\`\`env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}
\`\`\`

\`\`\`bash
pnpm --filter @b2b-starter/storefront build
\`\`\`

## 4. Activar backend/seed

\`\`\`env
B2B_CLIENT_PROFILE=${id}
\`\`\`

Si hay reglas de packaging nuevas, ejecutar seed/migracion segun entorno.

## 5. Deploy

- [ ] Vercel storefront: \`NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}\`.
- [ ] Render backend: \`B2B_CLIENT_PROFILE=${id}\`.
- [ ] Confirmar region/pais por defecto: \`${country}\`.
- [ ] Confirmar moneda: \`${currency}\`.
- [ ] Confirmar assets visibles en home y PDP.

## 6. QA minimo

- [ ] Home carga en desktop y mobile.
- [ ] Menu y mega menu muestran enlaces correctos.
- [ ] Catalogo lista productos con imagen.
- [ ] PDP permite unidad/caja y muestra packaging.
- [ ] Carrito muestra precio solo con login y packaging/logistica.
- [ ] Presupuesto exporta CSV/PDF si aplica.
- [ ] Admin edita home, brand profile, assets y packaging.

## Origen

Generado desde \`${from || "template"}\`.
`

const buildEnvExample = ({ id }) => `# Storefront
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}

# Backend seed/import helpers
B2B_CLIENT_PROFILE=${id}
`

const createProfile = ({
  id,
  name,
  legal,
  tagline,
  from,
  vertical,
  accent,
  country,
  currency,
  force,
  sync,
  dryRun,
}) => {
  assertValidId(id)
  assertHexColor(accent, "--accent")
  assertValidVertical(vertical)

  const brandName = name || titleCaseFromId(id)
  const legalName = legal || brandName
  const targetDir = path.join(profilesDir, id)
  const assetsDir = path.join(targetDir, "assets")
  const source = resolveProfileSource(from)

  if (fs.existsSync(targetDir) && !force) {
    throw new Error(`profiles/${id} already exists. Use --force to overwrite.`)
  }

  if (!dryRun) {
    fs.mkdirSync(assetsDir, { recursive: true })
  } else {
    console.log(`[dry-run] create ${path.relative(rootDir, targetDir)}`)
  }

  const profile = readJson(source.profilePath)
  profile.id = id
  profile.brand.name = brandName
  profile.brand.legalName = legalName
  profile.brand.tagline =
    tagline || profile.brand.tagline || "Portal B2B profesional para empresas"
  profile.brand.logo.light = `/images/${id}/logo-light.png`
  profile.brand.logo.dark = `/images/${id}/logo-dark.png`
  profile.brand.colors.accent = accent || profile.brand.colors.accent
  profile.seo.title = `${brandName} | Portal B2B`
  profile.seo.description = `Portal B2B ${brandName} para compra profesional con precios por cuenta, packaging industrial y presupuestos.`
  profile.markets.defaultCountryCode = country || profile.markets.defaultCountryCode
  profile.markets.currency = currency || profile.markets.currency
  profile.footer.description = `Soluciones profesionales ${brandName} para empresas que necesitan comprar con precision, control y disponibilidad.`
  stripDemoOnlyLinks(profile.navigation.main)
  profile.footer.columns?.forEach((column) => stripDemoOnlyLinks(column.links))

  const homepageTemplate = readJson(source.homepagePath)
  const homepage = mapDeep(homepageTemplate, (value) =>
    replaceClientImagePath(value, id)
  )
  homepage.heroBadgePrimary = brandName
  homepage.heroTitle = `Compra profesional ${brandName} con reglas reales de empresa.`
  homepage.heroImageAlt = `Producto profesional ${brandName} en contexto B2B`
  applyVerticalPack({ profile, homepage, brandName, vertical })
  profile.brand.tagline = tagline || verticalPacks[vertical].tagline

  writeJsonMaybe(
    path.join(targetDir, "client-profile.json"),
    profile,
    force,
    dryRun
  )
  writeJsonMaybe(
    path.join(targetDir, "homepage-content.json"),
    homepage,
    force,
    dryRun
  )
  const verticalPackagingCsv = buildVerticalPackagingCsv(vertical)

  if (verticalPackagingCsv) {
    writeTextMaybe(
      path.join(targetDir, "product-packaging.csv"),
      verticalPackagingCsv,
      force,
      dryRun
    )
  } else {
    copyFileMaybe(
      source.packagingPath,
      path.join(targetDir, "product-packaging.csv"),
      force,
      dryRun
    )
  }

  const verticalProductCatalogCsv = buildVerticalProductCatalogCsv(
    vertical,
    brandName
  )

  if (verticalProductCatalogCsv) {
    writeTextMaybe(
      path.join(targetDir, "product-catalog.csv"),
      verticalProductCatalogCsv,
      force,
      dryRun
    )
  }

  if (source.assetsDir && fs.existsSync(source.assetsDir)) {
    if (dryRun) {
      console.log(
        `[dry-run] copy ${path.relative(rootDir, source.assetsDir)} -> ${path.relative(
          rootDir,
          assetsDir
        )}`
      )
    } else {
      fs.cpSync(source.assetsDir, assetsDir, { recursive: true })
    }
  }

  const readme = `# ${brandName} Profile

Perfil generado para activar una demo B2B industrial sobre el template Medusa.

## Archivos

- \`client-profile.json\`: marca, SEO, navegacion, footer y fallbacks.
- \`homepage-content.json\`: hero, bloques comerciales, categorias y productos destacados.
- \`product-catalog.csv\`: productos, categorias, variantes, precios e imagenes base para seed/import.
- \`product-packaging.csv\`: reglas demo de packaging por SKU.
- \`assets/\`: logos e imagenes que se publicaran como \`/images/${id}/...\`.

## Origen

Generado desde \`${from || "template"}\`.

## Activacion

\`\`\`bash
pnpm sync:client-profile
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id} pnpm --filter @b2b-starter/storefront build
\`\`\`

Para produccion, configura \`NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}\` en Vercel y \`B2B_CLIENT_PROFILE=${id}\` en Render si quieres sembrar packaging de este perfil.

Consulta \`activation-checklist.md\` para el checklist completo de activacion y QA.
`

  writeTextMaybe(path.join(targetDir, "README.md"), readme, force, dryRun)
  writeTextMaybe(
    path.join(targetDir, "activation-checklist.md"),
    buildActivationChecklist({
      id,
      brandName,
      from,
      country: profile.markets.defaultCountryCode,
      currency: profile.markets.currency,
    }),
    force,
    dryRun
  )
  writeTextMaybe(
    path.join(targetDir, ".env.example"),
    buildEnvExample({ id }),
    force,
    dryRun
  )

  if (sync && !dryRun) {
    const syncResult = spawnSync(process.execPath, ["scripts/sync-client-profile.mjs"], {
      cwd: rootDir,
      stdio: "inherit",
    })

    if (syncResult.status !== 0) {
      throw new Error("Profile created, but sync-client-profile failed")
    }
  } else if (!sync) {
    console.log("Skipped sync-client-profile because --no-sync was provided")
  }

  console.log(`${dryRun ? "Would create" : "Created"} profiles/${id}`)
}

try {
  const options = parseArgs()

  if (!options.id) {
    throw new Error(`Missing --id\n\n${usage}`)
  }

  createProfile(options)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
