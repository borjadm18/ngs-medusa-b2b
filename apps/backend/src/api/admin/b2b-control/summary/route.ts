import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { CATALOG_RULES_MODULE } from "../../../../modules/catalog-rules";
import { PRODUCT_PACKAGING_MODULE } from "../../../../modules/product-packaging";
import { buildNgsPackagingFallback } from "../../../../utils/ngs-packaging-rules";

type QuoteStatusCounts = Record<string, number>;

const countByStatus = (items: Array<{ status?: string }>) =>
  items.reduce<QuoteStatusCounts>((acc, item) => {
    const status = item.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const catalogRulesModule = req.scope.resolve<any>(CATALOG_RULES_MODULE);
  const productPackagingModule = req.scope.resolve<any>(
    PRODUCT_PACKAGING_MODULE
  );

  const [
    companiesResult,
    quotesResult,
    productsResult,
    catalogRulesResult,
  ] = await Promise.all([
    query.graph({
      entity: "companies",
      fields: ["id", "onboarding_status", "payment_terms", "created_at"],
      pagination: { take: 500, skip: 0 },
    }),
    query.graph({
      entity: "quote",
      fields: [
        "id",
        "status",
        "created_at",
        "draft_order.total",
        "draft_order.items.quantity",
        "draft_order.items.metadata",
      ],
      pagination: { take: 500, skip: 0 },
    }),
    query.graph({
      entity: "product",
      fields: ["id", "title", "variants.id", "variants.sku"],
      pagination: { take: 500, skip: 0 },
    }),
    catalogRulesModule.listAndCountCatalogRules(
      {},
      {
        take: 500,
        skip: 0,
      }
    ),
  ]);

  const companies = companiesResult.data || [];
  const quotes = quotesResult.data || [];
  const products = productsResult.data || [];
  const [catalogRules, catalogRulesCount] = catalogRulesResult;
  const variants = products.flatMap((product: any) => product.variants || []);
  const variantIds = variants.map((variant: any) => variant.id);
  const storedPackaging = variantIds.length
    ? await productPackagingModule.listProductPackagings({
        variant_id: variantIds,
      })
    : [];
  const storedPackagingVariantIds = new Set(
    storedPackaging.map((item: any) => item.variant_id)
  );
  const fallbackPackaging = variants
    .filter((variant: any) => !storedPackagingVariantIds.has(variant.id))
    .map(buildNgsPackagingFallback)
    .filter(Boolean);
  const packaging = [...storedPackaging, ...fallbackPackaging];
  const quoteStatusCounts = countByStatus(quotes);
  const companyStatusCounts = countByStatus(
    companies.map((company: any) => ({
      status: company.onboarding_status || "approved",
    }))
  );
  const paymentTermsCounts = countByStatus(
    companies.map((company: any) => ({
      status: company.payment_terms || "bank_transfer",
    }))
  );
  const now = Date.now();
  const pendingQuotes = quotes.filter((quote: any) =>
    ["pending_merchant", "pending_customer"].includes(quote.status)
  );
  const staleQuotes = pendingQuotes.filter((quote: any) => {
    const createdAt = quote.created_at
      ? new Date(quote.created_at).getTime()
      : now;

    return now - createdAt > 1000 * 60 * 60 * 24 * 2;
  });
  const quoteTotals = quotes.reduce(
    (acc: { value: number; units: number; boxes: number; weight: number }, quote: any) => {
      acc.value += Number(quote.draft_order?.total || 0);

      for (const item of quote.draft_order?.items || []) {
        const metadata = item.metadata || {};
        acc.units += Number(item.quantity || 0);

        if (metadata.purchase_unit === "box") {
          const packageQuantity = Number(metadata.package_quantity || 0);
          const packageWeight = Number(metadata.package_weight || 0);
          acc.boxes += Number.isFinite(packageQuantity) ? packageQuantity : 0;
          acc.weight +=
            Number.isFinite(packageQuantity) && Number.isFinite(packageWeight)
              ? packageQuantity * packageWeight
              : 0;
        }
      }

      return acc;
    },
    { value: 0, units: 0, boxes: 0, weight: 0 }
  );
  const activeRules = catalogRules.filter(
    (rule: any) => rule.status === "active"
  );
  const rulesByType = catalogRules.reduce(
    (acc: Record<string, number>, rule: any) => {
      const type = rule.rule_type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const packagingCoverage = variantIds.length
    ? Math.round((packaging.length / variantIds.length) * 100)
    : 0;

  res.json({
    summary: {
      companies: {
        total: companies.length,
        pending: companyStatusCounts.pending || 0,
        approved: companyStatusCounts.approved || 0,
        rejected: companyStatusCounts.rejected || 0,
        by_payment_terms: paymentTermsCounts,
      },
      quotes: {
        total: quotes.length,
        by_status: quoteStatusCounts,
        pending_merchant: quoteStatusCounts.pending_merchant || 0,
        pending_customer: quoteStatusCounts.pending_customer || 0,
        accepted: quoteStatusCounts.accepted || 0,
        stale: staleQuotes.length,
        value: quoteTotals.value,
        units: quoteTotals.units,
        boxes: quoteTotals.boxes,
        estimated_weight: Number(quoteTotals.weight.toFixed(1)),
        conversion_rate: quotes.length
          ? Math.round(((quoteStatusCounts.accepted || 0) / quotes.length) * 100)
          : 0,
        average_value: quotes.length
          ? Math.round(quoteTotals.value / quotes.length)
          : 0,
      },
      catalog_rules: {
        total: catalogRulesCount,
        active: activeRules.length,
        by_type: rulesByType,
      },
      packaging: {
        total_variants: variantIds.length,
        configured: packaging.length,
        coverage: packagingCoverage,
      },
      products: {
        total: products.length,
        variants: variantIds.length,
      },
    },
  });
};
