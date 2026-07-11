import { HttpTypes } from "@medusajs/types"

export type ProductHighlight = {
  label: string
  value: string
}

export type ProductSpecGroup = {
  title: string
  rows: {
    label: string
    value: string
  }[]
}

export type ProductDocument = {
  title: string
  type: string
  detail: string
  url?: string
}

const readMetadata = (
  product: HttpTypes.StoreProduct,
  keys: string[]
): string | undefined => {
  const metadata = product.metadata || {}

  for (const key of keys) {
    const value = metadata[key]

    if (typeof value === "string" && value.trim()) {
      return value
    }

    if (typeof value === "number") {
      return value.toString()
    }
  }
}

const isDemoAudioProduct = (product: HttpTypes.StoreProduct) =>
  product.title?.toLowerCase().includes("ngs") ||
  product.categories?.some((category) =>
    category.name.toLowerCase().includes("audio")
  )

export const getProductSeries = (product: HttpTypes.StoreProduct) => {
  return (
    readMetadata(product, ["series", "serie", "product_series"]) ||
    product.collection?.title ||
    "Serie profesional"
  )
}

export const getProductSubtitle = (product: HttpTypes.StoreProduct) => {
  return (
    product.subtitle ||
    readMetadata(product, ["short_description", "type", "tipo"]) ||
    product.description ||
    "Producto profesional para canal B2B."
  )
}

export const getProductHighlights = (
  product: HttpTypes.StoreProduct
): ProductHighlight[] => {
  const metadataHighlights = [
    ["power_rms", "potencia_rms", "Potencia RMS"],
    ["woofer", "woofer_size", "Woofer"],
    ["dsp", "processing", "Procesamiento"],
    ["spl", "max_spl", "SPL max."],
  ]
    .map(([primaryKey, secondaryKey, label]) => {
      const value = readMetadata(product, [primaryKey, secondaryKey])
      return value ? { label, value } : null
    })
    .filter(Boolean) as ProductHighlight[]

  if (metadataHighlights.length) {
    return metadataHighlights
  }

  if (isDemoAudioProduct(product)) {
    return [
      { label: "Potencia RMS", value: "1200 W" },
      { label: "Woofer", value: '12"' },
      { label: "Procesamiento", value: "DSP" },
      { label: "SPL max.", value: "127 dB" },
    ]
  }

  return []
}

export const getProductSpecGroups = (
  product: HttpTypes.StoreProduct
): ProductSpecGroup[] => {
  const dimensions =
    product.height || product.width || product.length
      ? `${product.height || "-"} x ${product.width || "-"} x ${
          product.length || "-"
        } mm`
      : undefined

  const baseGroups: ProductSpecGroup[] = [
    {
      title: "Rendimiento",
      rows: [
        {
          label: "Potencia RMS",
          value: readMetadata(product, ["power_rms", "potencia_rms"]) || "1200 W",
        },
        {
          label: "SPL maximo",
          value: readMetadata(product, ["max_spl", "spl"]) || "127 dB",
        },
        {
          label: "Respuesta en frecuencia",
          value:
            readMetadata(product, ["frequency_response", "frecuencia"]) ||
            "50 Hz - 20 kHz",
        },
      ],
    },
    {
      title: "Componentes",
      rows: [
        {
          label: "Woofer",
          value: readMetadata(product, ["woofer", "woofer_size"]) || '12"',
        },
        {
          label: "Tweeter",
          value: readMetadata(product, ["tweeter"]) || '1.4"',
        },
        {
          label: "DSP",
          value: readMetadata(product, ["dsp", "processing"]) || "Si",
        },
      ],
    },
    {
      title: "Logistica",
      rows: [
        {
          label: "Peso",
          value: product.weight ? `${product.weight} g` : "Dato no publicado",
        },
        {
          label: "Dimensiones",
          value: dimensions || "Dato no publicado",
        },
        {
          label: "Unidad de venta",
          value: "Unidad o caja segun variante",
        },
      ],
    },
  ]

  if (!isDemoAudioProduct(product) && !product.metadata) {
    return baseGroups.map((group) => ({
      ...group,
      rows: group.rows.filter((row) => row.value !== "Dato no publicado"),
    }))
  }

  return baseGroups
}

export const getProductDocuments = (
  product: HttpTypes.StoreProduct
): ProductDocument[] => {
  const documents = product.metadata?.documents

  if (Array.isArray(documents)) {
    return documents
      .map((document) => {
        if (!document || typeof document !== "object") {
          return null
        }

        const item = document as Record<string, unknown>
        const title = item.title
        const url = item.url

        if (typeof title !== "string") {
          return null
        }

        return {
          title,
          type: typeof item.type === "string" ? item.type : "Documento",
          detail:
            typeof item.detail === "string"
              ? item.detail
              : "Documento tecnico",
          url: typeof url === "string" ? url : undefined,
        }
      })
      .filter(Boolean) as ProductDocument[]
  }

  return []
}

export const getInventorySummary = (product: HttpTypes.StoreProduct) => {
  const managedVariants = product.variants?.filter(
    (variant) => variant.manage_inventory !== false
  )
  const quantity =
    managedVariants?.reduce(
      (acc, variant) => acc + (variant.inventory_quantity ?? 0),
      0
    ) || 0
  const hasManagedInventory = !!managedVariants?.length

  if (!hasManagedInventory) {
    return {
      label: "En stock",
      detail: "Disponibilidad gestionada por canal B2B",
      tone: "green" as const,
      quantity: null,
    }
  }

  if (quantity <= 0) {
    return {
      label: "Sin stock",
      detail: "Consulta plazo con soporte comercial",
      tone: "red" as const,
      quantity,
    }
  }

  if (quantity <= 10) {
    return {
      label: "Stock limitado",
      detail: `${quantity} unidades disponibles`,
      tone: "amber" as const,
      quantity,
    }
  }

  return {
    label: "En stock",
    detail: `${quantity} unidades disponibles`,
    tone: "green" as const,
    quantity,
  }
}
