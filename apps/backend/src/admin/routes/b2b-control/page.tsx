import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Buildings,
  ChartBar,
  CheckCircleSolid,
  Clock,
  CurrencyDollar,
  ExclamationCircle,
  Package,
  Truck,
} from "@medusajs/icons";
import { Badge, Button, Container, Heading, ProgressTabs, Text } from "@medusajs/ui";
import { Link } from "react-router-dom";
import { useB2BControlSummary } from "../../hooks/api/b2b-control";

type Tone = "blue" | "green" | "orange" | "red" | "purple" | "grey";

const toneClasses: Record<Tone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  green: "border-green-200 bg-green-50 text-green-900",
  orange: "border-orange-200 bg-orange-50 text-orange-900",
  red: "border-red-200 bg-red-50 text-red-900",
  purple: "border-violet-200 bg-violet-50 text-violet-900",
  grey: "border-neutral-200 bg-neutral-50 text-neutral-900",
};

const barClasses: Record<Tone, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  orange: "bg-orange-500",
  red: "bg-red-600",
  purple: "bg-violet-600",
  grey: "bg-neutral-600",
};

const badgeColor: Record<Tone, "blue" | "green" | "orange" | "red" | "purple" | "grey"> = {
  blue: "blue",
  green: "green",
  orange: "orange",
  red: "red",
  purple: "purple",
  grey: "grey",
};

const B2BControl = () => {
  const { data, isLoading } = useB2BControlSummary();
  const summary = data?.summary;
  const quotePendingMerchant = summary?.quotes.pending_merchant || 0;
  const quotePendingCustomer = summary?.quotes.pending_customer || 0;
  const packagingCoverage = summary?.packaging.coverage || 0;
  const approvedCompanies = summary?.companies.approved || 0;
  const pendingCompanies = summary?.companies.pending || 0;
  const acceptedQuotes = summary?.quotes.accepted || 0;
  const activeRules = summary?.catalog_rules.active || 0;
  const staleQuotes = summary?.quotes.stale || 0;
  const totalQuotes = summary?.quotes.total || 0;
  const creditCompanies =
    (summary?.companies.by_payment_terms?.net_30 || 0) +
    (summary?.companies.by_payment_terms?.net_60 || 0) +
    (summary?.companies.by_payment_terms?.credit || 0);
  const demoScore = [
    quotePendingCustomer > 0,
    pendingCompanies > 0 && approvedCompanies > 0,
    activeRules > 0,
    packagingCoverage >= 80,
    staleQuotes === 0,
  ].filter(Boolean).length;

  const demoReadyItems = [
    {
      label: "Catalogo publico con precios privados",
      ready: true,
      detail: "Storefront y PDP publicos responden sin exponer tarifas.",
    },
    {
      label: "Quote aceptable para demo",
      ready: quotePendingCustomer > 0,
      detail:
        quotePendingCustomer > 0
          ? `${quotePendingCustomer} presupuesto(s) esperando cliente`
          : "Prepara un presupuesto pending_customer antes de la demo.",
    },
    {
      label: "Empresa pendiente/aprobada",
      ready: pendingCompanies > 0 && approvedCompanies > 0,
      detail: `${approvedCompanies} aprobada(s), ${pendingCompanies} pendiente(s)`,
    },
    {
      label: "Reglas comerciales activas",
      ready: activeRules > 0,
      detail: `${activeRules} regla(s) para precio, visibilidad o quote`,
    },
    {
      label: "Packaging/logistica",
      ready: packagingCoverage >= 80,
      detail: `${packagingCoverage}% de variantes con reglas`,
    },
  ];
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
      value: staleQuotes,
      action: "Priorizar seguimiento",
      href: "/quotes",
      status: staleQuotes > 0 ? "attention" : "ok",
    },
    {
      label: "Reglas comerciales activas",
      value: activeRules,
      action: "Gestionar reglas",
      href: "/catalog-rules",
      status: activeRules === 0 ? "attention" : "ok",
    },
  ];

  return (
    <div className="flex flex-col gap-y-4">
      <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base">
        <div className="border-b border-ui-border-base bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 px-6 py-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-md border border-white/20 bg-white/10 px-2 py-1">
                <Text size="xsmall" leading="compact" className="text-white">
                  Centro operativo B2B
                </Text>
              </div>
              <Heading level="h1" className="text-white">
                B2B Control
              </Heading>
              <Text size="small" leading="compact" className="mt-2 max-w-2xl text-neutral-300">
                Vista ejecutiva para controlar empresas, presupuestos, reglas,
                packaging y preparacion de demo industrial.
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
        </div>

        {isLoading ? (
          <div className="p-8">
            <Text size="small" leading="compact" className="text-center text-ui-fg-subtle">
              Cargando vista operativa...
            </Text>
          </div>
        ) : (
          <div className="grid gap-4 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Empresas B2B"
                value={summary?.companies.total || 0}
                detail={`${approvedCompanies} aprobadas / ${pendingCompanies} pendientes`}
                tone="blue"
                icon={<Buildings />}
              />
              <Metric
                label="Valor en quotes"
                value={formatCurrency(summary?.quotes.value || 0)}
                detail={`${totalQuotes} presupuestos / ${formatCurrency(summary?.quotes.average_value || 0)} ticket medio`}
                tone="green"
                icon={<CurrencyDollar />}
              />
              <Metric
                label="Conversion quote"
                value={`${summary?.quotes.conversion_rate || 0}%`}
                detail={`${acceptedQuotes} aceptados / ${quotePendingCustomer} esperando cliente`}
                tone={acceptedQuotes > 0 ? "green" : "orange"}
                icon={<ChartBar />}
              />
              <Metric
                label="Demo readiness"
                value={`${demoScore}/5`}
                detail="Estado minimo para una demo guiada"
                tone={demoScore >= 4 ? "green" : "orange"}
                icon={<CheckCircleSolid />}
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
              <SectionCard
                title="Operacion comercial"
                description="Lectura rapida del pipeline de presupuestos."
                tone="blue"
              >
                <FunnelRow
                  label="Pendiente comercial"
                  value={quotePendingMerchant}
                  total={totalQuotes}
                  tone={quotePendingMerchant > 0 ? "orange" : "green"}
                />
                <FunnelRow
                  label="Esperando cliente"
                  value={quotePendingCustomer}
                  total={totalQuotes}
                  tone="blue"
                />
                <FunnelRow
                  label="Aceptados"
                  value={acceptedQuotes}
                  total={totalQuotes}
                  tone="green"
                />
              </SectionCard>

              <SectionCard
                title="Packaging y logistica"
                description="Volumen, peso y expedicion sugerida para demo B2B."
                tone="purple"
              >
                <CompactMetric label="Unidades" value={summary?.quotes.units || 0} />
                <CompactMetric label="Cajas" value={summary?.quotes.boxes || 0} />
                <CompactMetric label="Peso estimado" value={`${summary?.quotes.estimated_weight || 0} kg`} />
                <CompactMetric label="Peso facturable" value={`${summary?.quotes.billable_weight || 0} kg`} />
                <CompactMetric label="Volumen" value={`${summary?.quotes.estimated_volume || 0} m3`} />
                <CompactMetric label="Transporte demo" value={formatCurrency(summary?.quotes.estimated_freight || 0)} />
                <div className="col-span-2 rounded-md border border-violet-200 bg-violet-50 px-3 py-2">
                  <Text size="small" leading="compact" weight="plus" className="text-violet-900">
                    {summary?.quotes.shipment_mode || "-"}
                  </Text>
                  <Text size="small" leading="compact" className="text-violet-700">
                    Ocupacion pallet {summary?.quotes.pallet_share || 0}
                  </Text>
                </div>
              </SectionCard>

              <SectionCard
                title="Clientes y condiciones"
                description="Estado de altas, credito y reglas comerciales."
                tone="green"
              >
                <CompactMetric label="Altas pendientes" value={pendingCompanies} />
                <CompactMetric label="Empresas credito" value={creditCompanies} />
                <CompactMetric label="Reglas activas" value={activeRules} />
                <CompactMetric label="Packaging" value={`${packagingCoverage}%`} />
                <ProgressLine
                  label="Cobertura packaging"
                  value={packagingCoverage}
                  tone={packagingCoverage >= 90 ? "green" : "orange"}
                />
              </SectionCard>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1fr_420px]">
              <Container className="divide-y p-0">
                <div className="px-6 py-4">
                  <Text size="small" leading="compact" weight="plus">
                    Demo readiness
                  </Text>
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    Checklist para saber si el playbook puede demostrarse sin
                    improvisar.
                  </Text>
                </div>
                <div className="grid gap-2 px-6 py-4">
                  {demoReadyItems.map((item) => (
                    <ReadinessItem key={item.label} item={item} />
                  ))}
                </div>
              </Container>

              <Container className="divide-y p-0">
                <div className="px-6 py-4">
                  <Text size="small" leading="compact" weight="plus">
                    Resumen demo
                  </Text>
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    Senales para abrir la reunion con datos.
                  </Text>
                </div>
                <div className="grid gap-3 px-6 py-4">
                  <SummaryPill label="Pipeline" value={formatCurrency(summary?.quotes.value || 0)} tone="green" />
                  <SummaryPill label="SLA quote" value={staleQuotes > 0 ? `${staleQuotes} atrasados` : "Sin atrasos"} tone={staleQuotes > 0 ? "orange" : "green"} />
                  <SummaryPill label="Reglas B2B" value={`${activeRules} activas`} tone={activeRules > 0 ? "blue" : "orange"} />
                  <SummaryPill label="Logistica" value={summary?.quotes.shipment_mode || "-"} tone="purple" />
                </div>
              </Container>
            </div>

            <Container className="divide-y p-0">
              <div className="px-6 py-4">
                <Text size="small" leading="compact" weight="plus">
                  Prioridades operativas
                </Text>
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Senales para saber que ensenar o cerrar antes de una demo B2B.
                </Text>
              </div>
              <div className="grid gap-2 px-6 py-4">
                {risks.map((risk) => (
                  <RiskItem key={risk.label} risk={risk} />
                ))}
              </div>
            </Container>
          </div>
        )}
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: Tone;
  icon: React.ReactNode;
}) => (
  <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <Text size="small" leading="compact" className="opacity-75">
          {label}
        </Text>
        <Text size="xlarge" leading="compact" weight="plus" className="mt-2">
          {value}
        </Text>
      </div>
      <div className="flex size-9 items-center justify-center rounded-md bg-white/70">
        {icon}
      </div>
    </div>
    <Text size="small" leading="compact" className="mt-3 opacity-80">
      {detail}
    </Text>
  </div>
);

const SectionCard = ({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description: string;
  tone: Tone;
  children: React.ReactNode;
}) => (
  <Container className="divide-y p-0">
    <div className="flex items-start justify-between gap-3 px-6 py-4">
      <div>
        <Text size="small" leading="compact" weight="plus">
          {title}
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          {description}
        </Text>
      </div>
      <Badge size="xsmall" color={badgeColor[tone]}>
        Live
      </Badge>
    </div>
    <div className="grid gap-3 px-6 py-4">{children}</div>
  </Container>
);

const CompactMetric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border bg-ui-bg-component px-3 py-2">
    <Text size="small" leading="compact" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small" leading="compact" weight="plus">
      {value}
    </Text>
  </div>
);

const ReadinessItem = ({
  item,
}: {
  item: { label: string; detail: string; ready: boolean };
}) => (
  <div
    className={`flex flex-col gap-2 rounded-md border px-4 py-3 md:flex-row md:items-center md:justify-between ${
      item.ready ? toneClasses.green : toneClasses.orange
    }`}
  >
    <div>
      <Text size="small" leading="compact" weight="plus">
        {item.label}
      </Text>
      <Text size="small" leading="compact" className="mt-1 opacity-75">
        {item.detail}
      </Text>
    </div>
    <Badge size="xsmall" color={item.ready ? "green" : "orange"}>
      {item.ready ? "Listo" : "Preparar"}
    </Badge>
  </div>
);

const RiskItem = ({ risk }: { risk: any }) => {
  const tone = risk.status === "attention" ? "orange" : "green";

  return (
    <div
      className={`flex flex-col gap-3 rounded-md border px-4 py-3 md:flex-row md:items-center md:justify-between ${toneClasses[tone]}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {risk.status === "attention" ? <ExclamationCircle /> : <CheckCircleSolid />}
          <Text size="small" leading="compact" weight="plus">
            {risk.label}
          </Text>
          <Badge size="xsmall" color={risk.status === "attention" ? "orange" : "green"}>
            {risk.status === "attention" ? "Atencion" : "OK"}
          </Badge>
        </div>
        <Text size="small" leading="compact" className="opacity-75">
          Valor actual: {risk.value}
        </Text>
      </div>
      <Button size="small" variant="secondary" asChild>
        <Link to={risk.href}>{risk.action}</Link>
      </Button>
    </div>
  );
};

const FunnelRow = ({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: Tone;
}) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          {label}
        </Text>
        <Text size="small" leading="compact" weight="plus">
          {value} ({percentage}%)
        </Text>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ui-bg-subtle">
        <div
          className={`h-full rounded-full ${barClasses[tone]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ProgressLine = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) => (
  <div className="grid gap-2 rounded-md border bg-ui-bg-component px-3 py-2">
    <div className="flex items-center justify-between">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" leading="compact" weight="plus">
        {value}%
      </Text>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-ui-bg-subtle">
      <div
        className={`h-full rounded-full ${barClasses[tone]}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

const SummaryPill = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: Tone;
}) => (
  <div className={`rounded-md border px-3 py-2 ${toneClasses[tone]}`}>
    <Text size="small" leading="compact" className="opacity-75">
      {label}
    </Text>
    <Text size="small" leading="compact" weight="plus" className="mt-1">
      {value}
    </Text>
  </div>
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
