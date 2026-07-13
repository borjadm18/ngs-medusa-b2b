import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { AdminUpsertCatalogRule } from "./validators";

export const adminCatalogRulesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/catalog-rules",
    middlewares: [validateAndTransformBody(AdminUpsertCatalogRule)],
  },
];
