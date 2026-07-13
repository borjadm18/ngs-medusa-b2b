import { FetchError } from "@medusajs/js-sdk";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";

export type CatalogRuleStatus = "draft" | "active" | "archived";
export type CatalogRuleType = "price" | "visibility" | "assortment" | "quote";
export type CatalogRuleTargetType =
  | "all"
  | "product"
  | "variant"
  | "category"
  | "collection";
export type CatalogRuleEffectType =
  | "discount_percentage"
  | "fixed_price"
  | "hide"
  | "show_only"
  | "requires_quote";

export type AdminCatalogRule = {
  id?: string;
  name: string;
  description?: string | null;
  status: CatalogRuleStatus;
  priority: number;
  rule_type: CatalogRuleType;
  target_type: CatalogRuleTargetType;
  target_id?: string | null;
  company_id?: string | null;
  customer_group_id?: string | null;
  region_id?: string | null;
  sales_channel_id?: string | null;
  zone_code?: string | null;
  currency_code?: string | null;
  effect_type: CatalogRuleEffectType;
  discount_percentage?: number | null;
  fixed_price?: number | null;
  minimum_quantity: number;
  starts_at?: string | null;
  ends_at?: string | null;
  metadata?: Record<string, unknown> | string | null;
};

export type CatalogRuleFilters = {
  status?: CatalogRuleStatus | "all";
  rule_type?: CatalogRuleType | "all";
  target_type?: CatalogRuleTargetType | "all";
  effect_type?: CatalogRuleEffectType | "all";
  company_id?: string;
  region_id?: string;
  sales_channel_id?: string;
  zone_code?: string;
  currency_code?: string;
  limit?: number;
  offset?: number;
};

type AdminCatalogRulesResponse = {
  catalog_rules: AdminCatalogRule[];
  count: number;
  limit: number;
  offset: number;
};

type AdminCatalogRuleResponse = {
  catalog_rule: AdminCatalogRule;
};

type AdminCatalogRulesMutationResponse = {
  catalog_rules: AdminCatalogRule[];
};

type AdminCatalogRulePriceListSyncResponse = {
  catalog_rule: AdminCatalogRule;
  price_list: {
    id: string;
    title: string;
  };
  synced: boolean;
};

type AdminCatalogRulePriceListSyncPayload = {
  id: string;
  title?: string;
  description?: string;
};

export type CatalogRuleSimulationContext = {
  product_id?: string;
  variant_id?: string;
  category_id?: string;
  collection_id?: string;
  company_id?: string;
  customer_group_id?: string;
  region_id?: string;
  sales_channel_id?: string;
  zone_code?: string;
  currency_code?: string;
};

type CatalogRuleSimulationResponse = {
  context: CatalogRuleSimulationContext;
  applicable_rules: AdminCatalogRule[];
};

export const catalogRulesQueryKeys = queryKeysFactory("catalog_rules");

const buildQuery = (filters?: CatalogRuleFilters) => {
  const query: Record<string, string | number> = {};

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") {
      return;
    }

    query[key] = value;
  });

  return query;
};

export const useCatalogRules = (
  filters?: CatalogRuleFilters,
  options?: UseQueryOptions<
    AdminCatalogRulesResponse,
    FetchError,
    AdminCatalogRulesResponse,
    QueryKey
  >
) => {
  return useQuery({
    queryKey: catalogRulesQueryKeys.list(filters || {}),
    queryFn: () =>
      sdk.client.fetch<AdminCatalogRulesResponse>("/admin/catalog-rules", {
        method: "GET",
        query: buildQuery(filters),
      }),
    ...options,
  });
};

export const useUpsertCatalogRule = (
  options?: UseMutationOptions<
    AdminCatalogRuleResponse,
    FetchError,
    AdminCatalogRule
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (catalogRule) =>
      sdk.client.fetch<AdminCatalogRuleResponse>("/admin/catalog-rules", {
        method: "POST",
        body: catalogRule,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: catalogRulesQueryKeys.all,
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteCatalogRule = (
  options?: UseMutationOptions<{ id: string }, FetchError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      sdk.client.fetch<{ id: string }>(`/admin/catalog-rules/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: catalogRulesQueryKeys.all,
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useBulkUpsertCatalogRules = (
  options?: UseMutationOptions<
    AdminCatalogRulesMutationResponse,
    FetchError,
    AdminCatalogRule[]
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (catalogRules) =>
      sdk.client.fetch<AdminCatalogRulesMutationResponse>(
        "/admin/catalog-rules/bulk",
        {
          method: "POST",
          body: {
            catalog_rules: catalogRules,
          },
        }
      ),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: catalogRulesQueryKeys.all,
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useSyncCatalogRulePriceList = (
  options?: UseMutationOptions<
    AdminCatalogRulePriceListSyncResponse,
    FetchError,
    AdminCatalogRulePriceListSyncPayload
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }) =>
      sdk.client.fetch<AdminCatalogRulePriceListSyncResponse>(
        `/admin/catalog-rules/${id}/sync-price-list`,
        {
          method: "POST",
          body,
        }
      ),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: catalogRulesQueryKeys.all,
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useSimulateCatalogRules = (
  options?: UseMutationOptions<
    CatalogRuleSimulationResponse,
    FetchError,
    CatalogRuleSimulationContext
  >
) => {
  return useMutation({
    mutationFn: (context) =>
      sdk.client.fetch<CatalogRuleSimulationResponse>("/store/catalog-rules", {
        method: "GET",
        query: buildQuery(context),
      }),
    ...options,
  });
};
