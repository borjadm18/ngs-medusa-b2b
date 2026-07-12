import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { AdminUpsertAsset } from "./validators";

export const adminAssetsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/assets",
    middlewares: [validateAndTransformBody(AdminUpsertAsset)],
  },
];
