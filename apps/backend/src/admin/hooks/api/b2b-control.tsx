import { FetchError } from "@medusajs/js-sdk";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";

export type B2BControlSummary = {
  companies: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    by_payment_terms: Record<string, number>;
  };
  quotes: {
    total: number;
    by_status: Record<string, number>;
    pending_merchant: number;
    pending_customer: number;
    accepted: number;
    stale: number;
    value: number;
    units: number;
    boxes: number;
    estimated_weight: number;
    conversion_rate: number;
    average_value: number;
  };
  catalog_rules: {
    total: number;
    active: number;
    by_type: Record<string, number>;
  };
  packaging: {
    total_variants: number;
    configured: number;
    coverage: number;
  };
  products: {
    total: number;
    variants: number;
  };
};

type B2BControlSummaryResponse = {
  summary: B2BControlSummary;
};

export const b2bControlQueryKeys = queryKeysFactory("b2b_control");

export const useB2BControlSummary = (
  options?: UseQueryOptions<
    B2BControlSummaryResponse,
    FetchError,
    B2BControlSummaryResponse,
    QueryKey
  >
) => {
  return useQuery({
    queryKey: b2bControlQueryKeys.detail("summary"),
    queryFn: () =>
      sdk.client.fetch<B2BControlSummaryResponse>(
        "/admin/b2b-control/summary",
        {
          method: "GET",
        }
      ),
    ...options,
  });
};
