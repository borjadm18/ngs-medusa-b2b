import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { AdminUpsertProductPackaging } from "./validators";

export const adminProductPackagingMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/product-packaging",
    middlewares: [validateAndTransformBody(AdminUpsertProductPackaging)],
  },
];
