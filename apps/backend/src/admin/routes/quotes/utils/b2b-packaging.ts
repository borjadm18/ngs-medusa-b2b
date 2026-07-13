type Metadata = Record<string, unknown> | null | undefined;

export type QuoteLineWithPackaging = {
  id?: string;
  title?: string;
  product_title?: string;
  variant_title?: string;
  variant_sku?: string | null;
  quantity?: number;
  unit_price?: number;
  total?: number;
  metadata?: Metadata;
};

export type QuoteLinePackaging = {
  packageQuantity: number;
  unitsPerBox: number;
  unitQuantity: number;
  boxesPerPallet?: number;
  packageWeight?: number;
  packageDimensions?: string;
  totalWeight?: number;
  palletShare?: number;
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.floor(numberValue)
    : undefined;
};

export const getQuoteLinePackaging = (
  metadata: Metadata,
  quantity: number
): QuoteLinePackaging | undefined => {
  const purchaseUnit = metadata?.purchase_unit;
  const unitsPerBox = toNumber(metadata?.units_per_box);
  const packageQuantity = toNumber(metadata?.package_quantity);
  const packageWeight = toNumber(metadata?.package_weight);
  const boxesPerPallet = toNumber(metadata?.boxes_per_pallet);
  const packageDimensions =
    typeof metadata?.package_dimensions === "string"
      ? metadata.package_dimensions
      : undefined;

  if (purchaseUnit !== "box" || !unitsPerBox || !packageQuantity) {
    return undefined;
  }

  return {
    packageQuantity,
    unitsPerBox,
    unitQuantity: quantity,
    boxesPerPallet,
    packageWeight,
    packageDimensions,
    totalWeight: packageWeight ? packageWeight * packageQuantity : undefined,
    palletShare: boxesPerPallet ? packageQuantity / boxesPerPallet : undefined,
  };
};

export const formatQuotePackagingLine = (packaging: QuoteLinePackaging) =>
  `${packaging.packageQuantity} cajas x ${packaging.unitsPerBox} uds = ${packaging.unitQuantity} uds`;

export const formatQuotePackagingDetails = (packaging: QuoteLinePackaging) =>
  [
    packaging.totalWeight
      ? `${packaging.totalWeight.toFixed(1)} kg estimados`
      : null,
    packaging.packageDimensions,
    packaging.boxesPerPallet
      ? `${packaging.boxesPerPallet} cajas/pallet`
      : null,
  ]
    .filter(Boolean)
    .join(" - ");

export const getQuotePackagingSummary = (
  items: QuoteLineWithPackaging[] | null | undefined
) =>
  (items || []).reduce(
    (summary, item) => {
      const quantity = item.quantity || 0;
      const packaging = getQuoteLinePackaging(item.metadata, quantity);

      summary.totalUnits += quantity;

      if (!packaging) {
        summary.looseUnits += quantity;
        return summary;
      }

      summary.boxes += packaging.packageQuantity;
      summary.boxedUnits += packaging.unitQuantity;
      summary.estimatedWeight += packaging.totalWeight ?? 0;

      if (packaging.palletShare) {
        summary.palletShare += packaging.palletShare;
      }

      return summary;
    },
    {
      boxes: 0,
      boxedUnits: 0,
      looseUnits: 0,
      totalUnits: 0,
      estimatedWeight: 0,
      palletShare: 0,
    }
  );

const escapeCsv = (value: unknown) => {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const quoteItemsToCsv = (
  items: QuoteLineWithPackaging[] | null | undefined
) => {
  const headers = [
    "Item ID",
    "Product",
    "Variant",
    "SKU",
    "Quantity",
    "Unit Price",
    "Line Total",
    "Purchase Unit",
    "Packages",
    "Units Per Box",
    "Total Units",
    "Estimated Weight",
    "Package Dimensions",
    "Boxes Per Pallet",
  ];

  const rows = (items || []).map((item) => {
    const packaging = getQuoteLinePackaging(item.metadata, item.quantity || 0);

    return [
      item.id,
      item.product_title || item.title,
      item.variant_title,
      item.variant_sku,
      item.quantity,
      item.unit_price,
      item.total,
      packaging ? "box" : "unit",
      packaging?.packageQuantity ?? "",
      packaging?.unitsPerBox ?? "",
      packaging?.unitQuantity ?? item.quantity,
      packaging?.totalWeight ? packaging.totalWeight.toFixed(1) : "",
      packaging?.packageDimensions ?? "",
      packaging?.boxesPerPallet ?? "",
    ].map(escapeCsv);
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};
