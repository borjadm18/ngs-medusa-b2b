import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { PRODUCT_PACKAGING_MODULE } from "../../../modules/product-packaging";

const normalizeVariantIds = (variantId: unknown): string[] => {
  if (Array.isArray(variantId)) {
    return variantId.flatMap((id) => String(id).split(",")).filter(Boolean);
  }

  if (typeof variantId === "string") {
    return variantId.split(",").filter(Boolean);
  }

  return [];
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productPackagingModule = req.scope.resolve<any>(
    PRODUCT_PACKAGING_MODULE
  );
  const variantIds = normalizeVariantIds(req.query.variant_id);

  if (!variantIds.length) {
    res.json({
      packaging: [],
    });
    return;
  }

  const packaging = await productPackagingModule.listProductPackagings({
    variant_id: variantIds,
  });

  res.json({
    packaging,
  });
};
