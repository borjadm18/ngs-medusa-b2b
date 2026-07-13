import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  AdminBulkUpsertCatalogRules,
  AdminUpsertCatalogRule,
} from "./validators";

export const adminCatalogRulesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/catalog-rules",
    middlewares: [validateAndTransformBody(AdminUpsertCatalogRule)],
  },
  {
    method: ["POST"],
    matcher: "/admin/catalog-rules/bulk",
    middlewares: [validateAndTransformBody(AdminBulkUpsertCatalogRules)],
  },
];
