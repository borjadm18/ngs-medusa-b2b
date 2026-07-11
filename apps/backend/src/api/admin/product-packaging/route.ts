import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { PRODUCT_PACKAGING_MODULE } from "../../../modules/product-packaging";
import { upsertProductPackagingWorkflow } from "../../../workflows/product-packaging/workflows";
import { AdminUpsertProductPackagingType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const productPackagingModule = req.scope.resolve<any>(
    PRODUCT_PACKAGING_MODULE
  );
  const variantId = req.query.variant_id as string | undefined;
  const filters = variantId ? { variant_id: variantId } : {};
  const packaging = await productPackagingModule.listProductPackagings(filters);

  res.json({
    packaging,
  });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpsertProductPackagingType>,
  res: MedusaResponse
) => {
  const { result } = await upsertProductPackagingWorkflow.run({
    input: req.validatedBody,
    container: req.scope,
  });

  res.json({
    packaging: result,
  });
};
