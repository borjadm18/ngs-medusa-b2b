import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BuildingStorefront } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useCatalogRules } from "../../hooks/api/catalog-rules";
import { useCompanies } from "../../hooks/api/companies";
import { useProductPackaging } from "../../hooks/api/product-packaging";
import { useQuotes } from "../../hooks/api/quotes";
import { sdk } from "../../lib/client";

const B2BControl = () => {
  const companies = useCompanies({ limit: 100 });
  const quotes = useQuotes({ limit: 100 });
  const catalogRules = useCatalogRules({ limit: 100 });
  const products = useQuery({
    queryKey: ["b2b-control-products"],
    queryFn: () =>
      (sdk.admin as any).product.list({
        limit: 100,
        fields: "id,title,variants.id,variants.sku",
      }),
  });

  const variants = ((products.data as any)?.products || []).flatMap(
    (product: any) => product.variants || []
  );
  const variantIds = variants.map((variant: any) => variant.id);
  const packaging = useProductPackaging(variantIds, {
    enabled: variantIds.length > 0,
  });
  const quoteRows = quotes.quotes || [];
  const companyRows = companies.data?.companies || [];
  const ruleRows = catalogRules.data?.catalog_rules || [];
  const packagingRows = packaging.data?.packaging || [];
  const activeRules = ruleRows.filter((rule) => rule.status === "active");
  const quotePendingMerchant = quoteRows.filter(
    (quote: any) => quote.status === "pending_merchant"
  ).length;
  const quotePendingCustomer = quoteRows.filter(
    (quote: any) => quote.status === "pending_customer"
  ).length;
  const packagingCoverage = variantIds.length
    ? Math.round((packagingRows.length / variantIds.length) * 100)
    : 0;
  const isLoading =
    companies.isLoading ||
    quotes.isLoading ||
    catalogRules.isLoading ||
    products.isLoading ||
    packaging.isLoading;
  const risks = [
    {
      label: "Presupuestos pendientes de comercial",
      value: quotePendingMerchant,
      action: "Revisar quotes",
      href: "/quotes",
      status: quotePendingMerchant > 0 ? "attention" : "ok",
    },
    {
      label: "Presupuestos esperando cliente",
      value: quotePendingCustomer,
      action: "Ver seguimiento",
      href: "/quotes",
      status: quotePendingCustomer > 0 ? "neutral" : "ok",
    },
    {
      label: "Cobertura de packaging",
      value: `${packagingCoverage}%`,
      action: "Completar reglas",
      href: "/products",
      status: packagingCoverage < 90 ? "attention" : "ok",
    },
    {
      label: "Reglas comerciales activas",
      value: activeRules.length,
      action: "Gestionar reglas",
      href: "/catalog-rules",
      status: activeRules.length === 0 ? "attention" : "ok",
    },
  ];

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Heading level="h1">B2B Control</Heading>
            <Text
              size="small"
              leading="compact"
              className="text-ui-fg-subtle"
            >
              Vista operativa para controlar clientes, quotes, reglas y
              packaging industrial.
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" asChild>
              <Link to="/quotes">Quotes</Link>
            </Button>
            <Button size="small" variant="secondary" asChild>
              <Link to="/catalog-rules">Reglas</Link>
            </Button>
            <Button size="small" variant="secondary" asChild>
              <Link to="/companies">Empresas</Link>
            </Button>
          </div>
        </div>
      </Container>

      {isLoading ? (
        <Container className="p-8">
          <Text
            size="small"
            leading="compact"
            className="text-ui-fg-subtle text-center"
          >
            Cargando vista operativa...
          </Text>
        </Container>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Empresas B2B" value={companyRows.length} />
            <Metric label="Presupuestos" value={quoteRows.length} />
            <Metric label="Reglas activas" value={activeRules.length} />
            <Metric label="Packaging" value={`${packagingCoverage}%`} />
          </div>

          <Container className="divide-y p-0">
            <div className="px-6 py-4">
              <Text size="small" leading="compact" weight="plus">
                Prioridades operativas
              </Text>
              <Text
                size="small"
                leading="compact"
                className="text-ui-fg-subtle"
              >
                Señales para saber qué enseñar o cerrar antes de una demo B2B.
              </Text>
            </div>
            <div className="grid gap-2 px-6 py-4">
              {risks.map((risk) => (
                <div
                  key={risk.label}
                  className="flex flex-col gap-3 rounded-md border bg-ui-bg-component px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Text size="small" leading="compact" weight="plus">
                        {risk.label}
                      </Text>
                      <Badge
                        size="xsmall"
                        color={risk.status === "attention" ? "orange" : "green"}
                      >
                        {risk.status === "attention" ? "Atencion" : "OK"}
                      </Badge>
                    </div>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      Valor actual: {risk.value}
                    </Text>
                  </div>
                  <Button size="small" variant="secondary" asChild>
                    <Link to={risk.href}>{risk.action}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </Container>
        </>
      )}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <Container className="p-0">
    <div className="px-6 py-4">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="large" leading="compact" weight="plus">
        {value}
      </Text>
    </div>
  </Container>
);

export const config = defineRouteConfig({
  label: "B2B Control",
  icon: BuildingStorefront,
});

export default B2BControl;
