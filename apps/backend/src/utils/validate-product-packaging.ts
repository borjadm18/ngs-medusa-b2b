import { PRODUCT_PACKAGING_MODULE } from "../modules/product-packaging";

type PackagingRule = {
  variant_id: string;
  minimum_order_quantity: number;
  quantity_increment: number;
  units_per_box: number;
};

type LineItemInput = {
  variant_id?: string | null;
  quantity?: number | null;
  metadata?: Record<string, unknown> | null;
};

const toPositiveInteger = (value: unknown) => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
};

const normalizeRule = (
  rule?: PackagingRule,
  metadata?: Record<string, unknown> | null
) => {
  return {
    minimumOrderQuantity:
      toPositiveInteger(rule?.minimum_order_quantity) ??
      toPositiveInteger(metadata?.minimum_order_quantity) ??
      1,
    quantityIncrement:
      toPositiveInteger(rule?.quantity_increment) ??
      toPositiveInteger(metadata?.quantity_increment) ??
      1,
    unitsPerBox:
      toPositiveInteger(rule?.units_per_box) ??
      toPositiveInteger(metadata?.units_per_box) ??
      1,
  };
};

export const validateProductPackagingLines = async (
  container: any,
  lineItems: LineItemInput[],
  options: {
    allowZeroQuantity?: boolean;
  } = {}
) => {
  const variantIds = Array.from(
    new Set(
      lineItems
        .map((lineItem) => lineItem.variant_id)
        .filter((variantId): variantId is string => !!variantId)
    )
  );

  if (!variantIds.length) {
    return;
  }

  const productPackagingModule = container.resolve(
    PRODUCT_PACKAGING_MODULE
  ) as any;
  const packagingRules = await productPackagingModule.listProductPackagings({
    variant_id: variantIds,
  });
  const rulesByVariantId = new Map<string, PackagingRule>(
    packagingRules.map((rule) => [rule.variant_id, rule])
  );

  for (const lineItem of lineItems) {
    if (!lineItem.variant_id) {
      continue;
    }

    const quantity = toPositiveInteger(lineItem.quantity);

    if (!quantity) {
      if (options.allowZeroQuantity && Number(lineItem.quantity) === 0) {
        continue;
      }

      throw new Error("Quantity must be a positive integer.");
    }

    const rule = normalizeRule(
      rulesByVariantId.get(lineItem.variant_id),
      lineItem.metadata
    );
    const purchaseUnit = lineItem.metadata?.purchase_unit;
    const packageQuantity = toPositiveInteger(
      lineItem.metadata?.package_quantity
    );

    if (quantity < rule.minimumOrderQuantity) {
      throw new Error(
        `Minimum order quantity for this variant is ${rule.minimumOrderQuantity} units.`
      );
    }

    if (quantity % rule.quantityIncrement !== 0) {
      throw new Error(
        `Quantity for this variant must be a multiple of ${rule.quantityIncrement}.`
      );
    }

    if (purchaseUnit === "box") {
      if (!packageQuantity) {
        throw new Error("Box purchases must include package quantity.");
      }

      if (quantity !== packageQuantity * rule.unitsPerBox) {
        throw new Error(
          `Box quantity must equal packages multiplied by ${rule.unitsPerBox} units per box.`
        );
      }
    }
  }
};
