import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { NGS_PACKAGING_RULES } from "../utils/ngs-packaging-rules";
import { upsertProductPackagingWorkflow } from "../workflows/product-packaging/workflows";

export default async function seed_product_packaging({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "sku"],
    filters: {
      sku: NGS_PACKAGING_RULES.map((rule) => rule.sku),
    },
  });

  const variantBySku = new Map(
    variants
      .filter((variant) => variant.sku)
      .map((variant) => [variant.sku as string, variant.id])
  );

  for (const rule of NGS_PACKAGING_RULES) {
    const variantId = variantBySku.get(rule.sku);

    if (!variantId) {
      logger.warn(`Packaging seed skipped; variant not found for ${rule.sku}`);
      continue;
    }

    await upsertProductPackagingWorkflow(container).run({
      input: {
        variant_id: variantId,
        sales_unit: rule.sales_unit,
        minimum_order_quantity: rule.minimum_order_quantity,
        quantity_increment: rule.quantity_increment,
        units_per_box: rule.units_per_box,
        boxes_per_pallet: rule.boxes_per_pallet,
        package_weight: rule.package_weight,
        package_dimensions: rule.package_dimensions,
      },
    });
  }

  logger.info(`Seeded packaging rules for ${variantBySku.size} NGS variants.`);
}
