import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { PRODUCT_PACKAGING_MODULE } from "../../../../modules/product-packaging";
import { buildNgsPackagingFallback } from "../../../../utils/ngs-packaging-rules";
import { StoreQuickOrderResolveType } from "../validators";

const normalizeSku = (sku: string) => sku.trim().toUpperCase();

export async function POST(
  req: MedusaRequest<StoreQuickOrderResolveType>,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const requestedSkus = Array.from(
    new Set(req.validatedBody.skus.map(normalizeSku).filter(Boolean))
  );

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.options.*",
    ],
    filters: {
      variants: {
        sku: requestedSkus,
      },
    },
    pagination: {
      take: 100,
      skip: 0,
    },
  });

  const matchedVariants = products.flatMap((product: any) =>
    (product.variants || [])
      .filter((variant: any) =>
        requestedSkus.includes(normalizeSku(variant.sku || ""))
      )
      .map((variant: any) => ({
        sku: normalizeSku(variant.sku),
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
        },
        variant: {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          options: variant.options || [],
        },
      }))
  );

  const variantIds = matchedVariants.map((match) => match.variant.id);
  const productPackagingModule = req.scope.resolve<any>(
    PRODUCT_PACKAGING_MODULE
  );
  const packaging = variantIds.length
    ? await productPackagingModule.listProductPackagings({
        variant_id: variantIds,
      })
    : [];
  const packagedVariantIds = new Set(
    packaging.map((item: any) => item.variant_id as string)
  );
  const missingVariantIds = variantIds.filter(
    (variantId) => !packagedVariantIds.has(variantId)
  );

  if (missingVariantIds.length) {
    const { data: variants } = await query.graph({
      entity: "variant",
      fields: ["id", "sku"],
      filters: {
        id: missingVariantIds,
      },
    });

    packaging.push(
      ...variants
        .map(buildNgsPackagingFallback)
        .filter((item): item is NonNullable<typeof item> => !!item)
    );
  }

  const packagingByVariantId = new Map(
    packaging.map((item: any) => [item.variant_id, item])
  );
  const resolved = matchedVariants.map((match) => ({
    ...match,
    packaging: packagingByVariantId.get(match.variant.id) || null,
  }));
  const resolvedSkus = new Set(resolved.map((item) => item.sku));

  res.json({
    items: resolved,
    missing_skus: requestedSkus.filter((sku) => !resolvedSkus.has(sku)),
  });
}
