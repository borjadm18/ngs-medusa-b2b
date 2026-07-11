import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { PRODUCT_PACKAGING_MODULE } from "../../../modules/product-packaging";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productPackagingModule = req.scope.resolve<any>(
    PRODUCT_PACKAGING_MODULE
  );
  const variantId = req.query.variant_id as string | undefined;

  if (!variantId) {
    res.json({
      packaging: [],
    });
    return;
  }

  const packaging = await productPackagingModule.listProductPackagings({
    variant_id: variantId,
  });

  res.json({
    packaging,
  });
};
