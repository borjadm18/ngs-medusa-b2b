import type {
  HttpTypes,
  StoreProduct,
  StoreProductVariant,
} from "@medusajs/types"

export type PurchaseUnit = "unit" | "box"

export type VariantPackaging = {
  unitsPerBox: number
  unitLabel: string
  boxLabel: string
  minimumOrderQuantity: number
  quantityIncrement: number
  packageWeight?: number
  packageDimensions?: string
  palletUnits?: number
}

type MetadataSource = {
  metadata?: Record<string, unknown> | null
}

const FALLBACK_UNITS_PER_BOX: Record<string, number> = {
  audio: 4,
  auriculares: 10,
  cable: 24,
  conectividad: 12,
  gaming: 6,
  monitor: 2,
  mouse: 24,
  raton: 24,
  teclado: 12,
  webcam: 24,
}

const toNumber = (value: unknown) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.floor(numberValue)
    : undefined
}

const readMetadataNumber = (
  metadata: Record<string, unknown> | null | undefined,
  keys: string[]
) => {
  if (!metadata) {
    return undefined
  }

  for (const key of keys) {
    const value = metadata[key]

    if (
      typeof value === "object" &&
      value !== null &&
      key === "b2b_packaging"
    ) {
      const nested = value as Record<string, unknown>
      const nestedValue = toNumber(
        nested.units_per_box ?? nested.unitsPerBox ?? nested.box_quantity
      )

      if (nestedValue) {
        return nestedValue
      }
    }

    const numberValue = toNumber(value)

    if (numberValue) {
      return numberValue
    }
  }
}

const fallbackUnitsPerBox = (
  product: Pick<StoreProduct, "title" | "handle" | "tags">,
  variant?: Pick<StoreProductVariant, "title" | "sku">
) => {
  const haystack = [
    product.title,
    product.handle,
    variant?.title,
    variant?.sku,
    product.tags?.map((tag) => tag.value).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const match = Object.entries(FALLBACK_UNITS_PER_BOX).find(([needle]) =>
    haystack.includes(needle)
  )

  return match?.[1] ?? 6
}

export const getVariantPackaging = (
  product: HttpTypes.StoreProduct | StoreProduct,
  variant?: HttpTypes.StoreProductVariant | StoreProductVariant,
  override?: {
    units_per_box?: number | null
    minimum_order_quantity?: number | null
    quantity_increment?: number | null
    boxes_per_pallet?: number | null
    package_weight?: number | null
    package_dimensions?: string | null
  }
): VariantPackaging => {
  const productMetadata = (product as MetadataSource).metadata
  const variantMetadata = (variant as MetadataSource | undefined)?.metadata

  const unitsPerBox =
    toNumber(override?.units_per_box) ??
    readMetadataNumber(variantMetadata, [
      "units_per_box",
      "unitsPerBox",
      "box_quantity",
      "b2b_packaging",
    ]) ??
    readMetadataNumber(productMetadata, [
      "units_per_box",
      "unitsPerBox",
      "box_quantity",
      "b2b_packaging",
    ]) ??
    fallbackUnitsPerBox(product as StoreProduct, variant as StoreProductVariant)

  const palletUnits =
    toNumber(override?.boxes_per_pallet) ??
    readMetadataNumber(variantMetadata, ["pallet_units", "palletUnits"]) ??
    readMetadataNumber(productMetadata, ["pallet_units", "palletUnits"])

  return {
    unitsPerBox,
    unitLabel: "unidad",
    boxLabel: unitsPerBox === 1 ? "caja" : `caja (${unitsPerBox} uds)`,
    minimumOrderQuantity: toNumber(override?.minimum_order_quantity) ?? 1,
    quantityIncrement: toNumber(override?.quantity_increment) ?? 1,
    packageWeight: toNumber(override?.package_weight),
    packageDimensions: override?.package_dimensions || undefined,
    palletUnits,
  }
}

export const getCartLinePackaging = (
  metadata: Record<string, unknown> | null | undefined,
  quantity: number
) => {
  const purchaseUnit = metadata?.purchase_unit as PurchaseUnit | undefined
  const unitsPerBox = toNumber(metadata?.units_per_box)
  const packageQuantity = toNumber(metadata?.package_quantity)
  const packageWeight = toNumber(metadata?.package_weight)
  const boxesPerPallet = toNumber(metadata?.boxes_per_pallet)
  const packageDimensions =
    typeof metadata?.package_dimensions === "string"
      ? metadata.package_dimensions
      : undefined

  if (purchaseUnit !== "box" || !unitsPerBox || !packageQuantity) {
    return undefined
  }

  return {
    purchaseUnit,
    unitsPerBox,
    packageQuantity,
    unitQuantity: quantity,
    boxesPerPallet,
    packageWeight,
    packageDimensions,
    totalWeight: packageWeight ? packageWeight * packageQuantity : undefined,
    palletShare: boxesPerPallet ? packageQuantity / boxesPerPallet : undefined,
  }
}
