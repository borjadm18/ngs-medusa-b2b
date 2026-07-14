import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

type QuoteLine = {
  id?: string;
  title?: string;
  product_title?: string;
  variant_title?: string;
  variant_sku?: string | null;
  quantity?: number;
  unit_price?: number;
  total?: number;
  metadata?: Record<string, unknown> | null;
};

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

const toNumber = (value: unknown) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const getPackaging = (item: QuoteLine) => {
  const metadata = item.metadata || {};
  const purchaseUnit = metadata.purchase_unit;
  const unitsPerBox = toNumber(metadata.units_per_box);
  const packageQuantity = toNumber(metadata.package_quantity);
  const packageWeight = toNumber(metadata.package_weight);
  const boxesPerPallet = toNumber(metadata.boxes_per_pallet);

  if (purchaseUnit !== "box" || !unitsPerBox || !packageQuantity) {
    return {
      purchaseUnit: "unit",
      packageQuantity: "",
      unitsPerBox: "",
      totalUnits: item.quantity || 0,
      estimatedWeight: "",
      packageDimensions: "",
      boxesPerPallet: "",
      palletShare: "",
    };
  }

  return {
    purchaseUnit: "box",
    packageQuantity,
    unitsPerBox,
    totalUnits: item.quantity || 0,
    estimatedWeight: packageWeight
      ? (packageWeight * packageQuantity).toFixed(1)
      : "",
    packageDimensions:
      typeof metadata.package_dimensions === "string"
        ? metadata.package_dimensions
        : "",
    boxesPerPallet: boxesPerPallet || "",
    palletShare: boxesPerPallet
      ? (packageQuantity / boxesPerPallet).toFixed(2)
      : "",
  };
};

const buildQuoteCsv = (quote: any) => {
  const order = quote.draft_order || {};
  const customer = order.customer || quote.customer || {};
  const items: QuoteLine[] = order.items || [];
  const headerRows = [
    ["Presupuesto", quote.id],
    ["Estado", quote.status],
    ["Pedido draft", order.display_id ? `#${order.display_id}` : order.id],
    ["Cliente", customer.email],
    ["Moneda", order.currency_code],
    ["Subtotal", order.subtotal],
    ["Descuento", order.discount_total],
    ["Envio", order.shipping_total],
    ["Impuestos", order.tax_total],
    ["Total", order.total],
    [],
  ];
  const itemHeaders = [
    "Item ID",
    "Producto",
    "Variante",
    "SKU",
    "Cantidad",
    "Precio unitario",
    "Total linea",
    "Unidad compra",
    "Cajas",
    "Unidades/caja",
    "Unidades totales",
    "Peso estimado kg",
    "Dimensiones bulto",
    "Cajas/pallet",
    "Pallets estimados",
  ];
  const itemRows = items.map((item) => {
    const packaging = getPackaging(item);

    return [
      item.id,
      item.product_title || item.title,
      item.variant_title,
      item.variant_sku,
      item.quantity,
      item.unit_price,
      item.total,
      packaging.purchaseUnit,
      packaging.packageQuantity,
      packaging.unitsPerBox,
      packaging.totalUnits,
      packaging.estimatedWeight,
      packaging.packageDimensions,
      packaging.boxesPerPallet,
      packaging.palletShare,
    ];
  });

  return [...headerRows, itemHeaders, ...itemRows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: [
        "id",
        "status",
        "customer.id",
        "customer.email",
        "draft_order.id",
        "draft_order.display_id",
        "draft_order.currency_code",
        "draft_order.subtotal",
        "draft_order.discount_total",
        "draft_order.shipping_total",
        "draft_order.tax_total",
        "draft_order.total",
        "draft_order.customer.id",
        "draft_order.customer.email",
        "draft_order.items.id",
        "draft_order.items.title",
        "draft_order.items.product_title",
        "draft_order.items.variant_title",
        "draft_order.items.variant_sku",
        "draft_order.items.quantity",
        "draft_order.items.unit_price",
        "draft_order.items.total",
        "draft_order.items.metadata",
      ],
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  const csv = buildQuoteCsv(quote);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="presupuesto-${quote.id}.csv"`
  );
  res.status(200).send(csv);
};
