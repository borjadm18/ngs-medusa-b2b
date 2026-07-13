import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { upsertCatalogRuleWorkflow } from "../../../../workflows/catalog-rules/workflows";
import { AdminBulkUpsertCatalogRulesType } from "../validators";

const serializeRulePayload = (
  body: AdminBulkUpsertCatalogRulesType["catalog_rules"][number]
) => ({
  ...body,
  metadata: body.metadata ? JSON.stringify(body.metadata) : null,
});

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminBulkUpsertCatalogRulesType>,
  res: MedusaResponse
) => {
  const catalog_rules: unknown[] = [];

  for (const rule of req.validatedBody.catalog_rules) {
    const { result } = await upsertCatalogRuleWorkflow.run({
      input: serializeRulePayload(rule),
      container: req.scope,
    });

    catalog_rules.push(result);
  }

  res.json({
    catalog_rules,
  });
};
