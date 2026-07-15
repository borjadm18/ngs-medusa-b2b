import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BuildingStorefront } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import { Link } from "react-router-dom";
import { useB2BControlSummary } from "../../hooks/api/b2b-control";

const B2BControl = () => {
  const { data, isLoading } = useB2BControlSummary();
  const summary = data?.summary;
  const quotePendingMerchant = summary?.quotes.pending_merchant || 0;
  const quotePendingCustomer = summary?.quotes.pending_customer || 0;
  const packagingCoverage = summary?.packaging.coverage || 0;
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
      label: "Quotes fuera de SLA",
      value: summary?.quotes.stale || 0,
      action: "Priorizar seguimiento",
      href: "/quotes",
      status: (summary?.quotes.stale || 0) > 0 ? "attention" : "ok",
    },
    {
      label: "Reglas comerciales activas",
      value: summary?.catalog_rules.active || 0,
      action: "Gestionar reglas",
      href: "/catalog-rules",
      status: (summary?.catalog_rules.active || 0) === 0 ? "attention" : "ok",
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
            <Metric label="Empresas B2B" value={summary?.companies.total || 0} />
            <Metric label="Altas pendientes" value={summary?.companies.pending || 0} />
            <Metric label="Presupuestos" value={summary?.quotes.total || 0} />
            <Metric
              label="Reglas activas"
              value={summary?.catalog_rules.active || 0}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Valor quotes"
              value={formatCurrency(summary?.quotes.value || 0)}
            />
            <Metric
              label="Ticket medio quote"
              value={formatCurrency(summary?.quotes.average_value || 0)}
            />
            <Metric
              label="Conversion quote"
              value={`${summary?.quotes.conversion_rate || 0}%`}
            />
            <Metric label="Packaging" value={`${packagingCoverage}%`} />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Unidades" value={summary?.quotes.units || 0} />
            <Metric label="Cajas" value={summary?.quotes.boxes || 0} />
            <Metric
              label="Peso estimado"
              value={`${summary?.quotes.estimated_weight || 0} kg`}
            />
            <Metric
              label="Empresas credito"
              value={
                (summary?.companies.by_payment_terms?.net_30 || 0) +
                (summary?.companies.by_payment_terms?.net_60 || 0) +
                (summary?.companies.by_payment_terms?.credit || 0)
              }
            />
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export const config = defineRouteConfig({
  label: "B2B Control",
  icon: BuildingStorefront,
});

export default B2BControl;
