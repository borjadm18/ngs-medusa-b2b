import { ExclamationCircle } from "@medusajs/icons";
import {
  Avatar,
  Badge,
  Container,
  Heading,
  Table,
  Text,
  Toaster,
} from "@medusajs/ui";
import { QueryEmployee } from "../../../../types";
import { useParams } from "react-router-dom";
import { useAdminCustomerGroups, useCompany, useQuotes } from "../../../hooks/api";
import { useCatalogRules } from "../../../hooks/api/catalog-rules";
import { formatAmount } from "../../../utils";
import { CompanyActionsMenu } from "../components";
import {
  EmployeeCreateDrawer,
  EmployeesActionsMenu,
} from "../components/employees";

const CompanyDetails = () => {
  const { companyId } = useParams();
  const { data, isPending } = useCompany(companyId!, {
    fields:
      "*employees,*employees.customer,*employees.company,*customer_group,*approval_settings",
  });

  const { data: customerGroups } = useAdminCustomerGroups();

  const company = data?.company;
  const employeeEmails = new Set(
    (company?.employees || [])
      .map((employee: QueryEmployee) => employee.customer?.email)
      .filter(Boolean)
  );
  const employeeCustomerIds = new Set(
    (company?.employees || [])
      .map((employee: QueryEmployee) => employee.customer?.id)
      .filter(Boolean)
  );
  const { quotes = [] } = useQuotes({
    limit: 100,
    offset: 0,
  });
  const { data: companyRules } = useCatalogRules(
    company
      ? {
          company_id: company.id,
          limit: 20,
        }
      : undefined
  );
  const { data: groupRules } = useCatalogRules(
    company?.customer_group?.id
      ? {
          customer_group_id: company.customer_group.id,
          limit: 20,
        }
      : undefined
  );

  if (!company) {
    return <div>Empresa no encontrada</div>;
  }

  const companyQuotes = quotes.filter((quote: any) => {
    const customerEmail = quote.customer?.email;
    const customerId = quote.customer?.id;

    return (
      (customerEmail && employeeEmails.has(customerEmail)) ||
      (customerId && employeeCustomerIds.has(customerId))
    );
  });
  const companyRulesList = companyRules?.catalog_rules || [];
  const groupRulesList = groupRules?.catalog_rules || [];
  const applicableRules = [...companyRulesList, ...groupRulesList];
  const quoteTotal = companyQuotes.reduce(
    (sum: number, quote: any) => sum + Number(quote.draft_order?.total || 0),
    0
  );
  const currencyCode =
    company.currency_code ||
    companyQuotes[0]?.draft_order?.currency_code ||
    "eur";

  return (
    <div className="flex flex-col gap-4">
      <Container className="flex flex-col p-0 overflow-hidden">
        {!isPending && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 justify-between">
              <div className="flex items-center gap-2">
                <Avatar
                  src={company?.logo_url || undefined}
                  fallback={company?.name?.charAt(0)}
                />
                <Heading className="font-sans font-medium h1-core">
                  {company?.name}
                </Heading>
              </div>
              <CompanyActionsMenu
                company={company}
                customerGroups={customerGroups}
              />
            </div>
            <div className="grid gap-3 border-b border-gray-200 px-6 py-4 md:grid-cols-4">
              <CompanyMetric label="Miembros" value={company.employees?.length || 0} />
              <CompanyMetric
                label="Presupuestos"
                value={companyQuotes.length}
                hint={formatAmount(quoteTotal, currencyCode)}
              />
              <CompanyMetric
                label="Reglas comerciales"
                value={applicableRules.length}
                hint={company.customer_group?.name || "Sin grupo"}
              />
              <CompanyMetric
                label="Condiciones"
                value={formatPaymentTerms(company.payment_terms)}
                hint={company.default_payment_method || "Metodo no definido"}
              />
            </div>
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small max-w-fit">
                    Telefono
                  </Table.Cell>
                  <Table.Cell>{company?.phone}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Email
                  </Table.Cell>
                  <Table.Cell>{company?.email}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Estado onboarding
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="small"
                      color={
                        company?.onboarding_status === "pending"
                          ? "orange"
                          : company?.onboarding_status === "rejected"
                          ? "red"
                          : "green"
                      }
                    >
                      {formatOnboardingStatus(company?.onboarding_status)}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    CIF / VAT
                  </Table.Cell>
                  <Table.Cell>{company?.tax_id || "-"}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Sector
                  </Table.Cell>
                  <Table.Cell>{company?.sector || "-"}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Condiciones pago
                  </Table.Cell>
                  <Table.Cell>{formatPaymentTerms(company?.payment_terms)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Direccion
                  </Table.Cell>
                  <Table.Cell>{company?.address}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Ciudad
                  </Table.Cell>
                  <Table.Cell>{company?.city}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Provincia
                  </Table.Cell>
                  <Table.Cell>{company?.state}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Moneda
                  </Table.Cell>
                  <Table.Cell>
                    {company?.currency_code?.toUpperCase()}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Grupo de clientes
                  </Table.Cell>
                  <Table.Cell>
                    {company?.customer_group ? (
                      <Badge size="small" color="blue">
                        {company?.customer_group?.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Reglas de aprobacion
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      {company?.approval_settings?.requires_admin_approval && (
                        <Badge size="small" color="purple">
                          Requiere aprobacion admin
                        </Badge>
                      )}
                      {company?.approval_settings
                        ?.requires_sales_manager_approval && (
                        <Badge size="small" color="purple">
                          Requiere aprobacion comercial
                        </Badge>
                      )}
                      {!company?.approval_settings?.requires_admin_approval &&
                        !company?.approval_settings
                          ?.requires_sales_manager_approval && (
                          <Badge size="small" color="grey">
                            Sin aprobacion obligatoria
                          </Badge>
                        )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </>
        )}
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        {!isPending && (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-6 py-4">
              <div>
                <Heading className="font-sans font-medium h1-core">
                  Condiciones y tarifas aplicadas
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Reglas especificas de empresa y reglas heredadas de su grupo.
                </Text>
              </div>
            </div>
            {applicableRules.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Regla</Table.HeaderCell>
                    <Table.HeaderCell>Tipo</Table.HeaderCell>
                    <Table.HeaderCell>Condicion</Table.HeaderCell>
                    <Table.HeaderCell>Alcance</Table.HeaderCell>
                    <Table.HeaderCell>Estado</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {applicableRules.slice(0, 8).map((rule: any) => (
                    <Table.Row key={rule.id}>
                      <Table.Cell>{rule.name}</Table.Cell>
                      <Table.Cell>{formatRuleType(rule.rule_type)}</Table.Cell>
                      <Table.Cell>{formatRuleEffect(rule)}</Table.Cell>
                      <Table.Cell>
                        {rule.company_id ? "Empresa" : "Grupo de clientes"}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          size="small"
                          color={rule.status === "active" ? "green" : "grey"}
                        >
                          {rule.status === "active" ? "Activa" : "Inactiva"}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <EmptyPanel
                title="Sin reglas aplicadas"
                description="Esta empresa solo usara la tarifa base hasta asignar una regla o grupo."
              />
            )}
          </>
        )}
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        {!isPending && (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-6 py-4">
              <div>
                <Heading className="font-sans font-medium h1-core">
                  Historico agregado de la empresa
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Presupuestos vinculados a miembros de esta cuenta.
                </Text>
              </div>
            </div>
            {companyQuotes.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>Usuario</Table.HeaderCell>
                    <Table.HeaderCell>Estado</Table.HeaderCell>
                    <Table.HeaderCell>Total</Table.HeaderCell>
                    <Table.HeaderCell>Fecha</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {companyQuotes.slice(0, 6).map((quote: any) => (
                    <Table.Row
                      key={quote.id}
                      className="cursor-pointer"
                      onClick={() => {
                        window.location.href = `/app/quotes/${quote.id}`;
                      }}
                    >
                      <Table.Cell>
                        #{quote.draft_order?.display_id || quote.id}
                      </Table.Cell>
                      <Table.Cell>{quote.customer?.email || "-"}</Table.Cell>
                      <Table.Cell>
                        <Badge size="small" color="blue">
                          {formatQuoteStatus(quote.status)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {formatAmount(
                          quote.draft_order?.total || 0,
                          quote.draft_order?.currency_code || currencyCode
                        )}
                      </Table.Cell>
                      <Table.Cell>{formatDate(quote.created_at)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <EmptyPanel
                title="Sin presupuestos vinculados"
                description="Cuando un miembro solicite presupuesto, aparecera aqui dentro del historico de empresa."
              />
            )}
          </>
        )}
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        {!isPending && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Heading className="font-sans font-medium h1-core">
                  Miembros del equipo
                </Heading>
              </div>
              <EmployeeCreateDrawer company={company} />
            </div>
            {company?.employees && company?.employees.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Nombre</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Limite de gasto</Table.HeaderCell>
                    <Table.HeaderCell>Acciones</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {company?.employees.map((employee: QueryEmployee) => (
                    <Table.Row
                      key={employee.id}
                      onClick={() => {
                        window.location.href = `/app/customers/${
                          employee!.customer!.id
                        }`;
                      }}
                      className="cursor-pointer"
                    >
                      <Table.Cell className="w-6 h-6 items-center justify-center">
                        <Avatar
                          fallback={
                            employee.customer?.first_name?.charAt(0) || ""
                          }
                        />
                      </Table.Cell>
                      <Table.Cell className="flex w-fit gap-2 items-center">
                        {employee.customer?.first_name}{" "}
                        {employee.customer?.last_name}
                    {employee.is_admin && (
                          <Badge
                            size="2xsmall"
                            color={employee.is_admin ? "green" : "grey"}
                          >
                            Admin
                          </Badge>
                        )}
                        {employee.role && (
                          <Badge size="2xsmall" color="blue">
                            {formatEmployeeRole(employee.role)}
                          </Badge>
                        )}
                        {employee.status === "invited" && (
                          <Badge size="2xsmall" color="orange">
                            Invitado
                          </Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>{employee.customer?.email}</Table.Cell>
                      <Table.Cell>
                        {formatAmount(
                          employee.spending_limit,
                          company?.currency_code || "USD"
                        )}
                      </Table.Cell>
                      <Table.Cell onClick={(e) => e.stopPropagation()}>
                        <EmployeesActionsMenu
                          company={company}
                          employee={employee}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div className="flex h-[400px] w-full flex-col items-center justify-center gap-y-4">
                <div className="flex flex-col items-center gap-y-3">
                  <ExclamationCircle />
                  <div className="flex flex-col items-center gap-y-1">
                    <Text className="font-medium font-sans txt-compact-small">
                      Sin registros
                    </Text>
                    <Text className="txt-small text-ui-fg-muted">
                      Esta empresa todavia no tiene miembros.
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
      <Toaster />
    </div>
  );
};

export default CompanyDetails;

const CompanyMetric = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
    <Text size="small" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="base" weight="plus" className="mt-1">
      {value}
    </Text>
    {hint && (
      <Text size="xsmall" className="mt-1 text-ui-fg-muted">
        {hint}
      </Text>
    )}
  </div>
);

const EmptyPanel = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="px-6 py-8">
    <Text size="small" weight="plus">
      {title}
    </Text>
    <Text size="small" className="mt-1 text-ui-fg-subtle">
      {description}
    </Text>
  </div>
);

const formatOnboardingStatus = (status?: string) => {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
  };

  return labels[status || "approved"] || "Aprobada";
};

const formatPaymentTerms = (value?: string | null) => {
  const labels: Record<string, string> = {
    prepaid: "Pago anticipado",
    bank_transfer: "Transferencia bancaria",
    net_30: "Credito 30 dias",
    net_60: "Credito 60 dias",
    credit: "Credito comercial",
  };

  return labels[value || "bank_transfer"] || "Transferencia bancaria";
};

const formatEmployeeRole = (value: string) => {
  const labels: Record<string, string> = {
    buyer: "Comprador",
    approver: "Aprobador",
    company_admin: "Admin empresa",
    readonly: "Solo lectura",
  };

  return labels[value] || value;
};

const formatRuleType = (value?: string) => {
  const labels: Record<string, string> = {
    price: "Precio",
    visibility: "Visibilidad",
    assortment: "Surtido",
    quote: "Presupuesto",
  };

  return labels[value || ""] || value || "-";
};

const formatRuleEffect = (rule: any) => {
  if (rule.effect_type === "discount_percentage") {
    return `${rule.discount_percentage || 0}% dto. desde ${rule.minimum_quantity || 1} uds`;
  }

  if (rule.effect_type === "fixed_price") {
    return `${rule.fixed_price || 0} precio fijo desde ${rule.minimum_quantity || 1} uds`;
  }

  if (rule.effect_type === "requires_quote") {
    return "Requiere presupuesto";
  }

  if (rule.effect_type === "show_only") {
    return "Surtido permitido";
  }

  if (rule.effect_type === "hide") {
    return "Oculto";
  }

  return rule.effect_type || "-";
};

const formatQuoteStatus = (value?: string) => {
  const labels: Record<string, string> = {
    pending_merchant: "Pendiente comercial",
    pending_customer: "Pendiente cliente",
    accepted: "Aceptado",
    rejected: "Rechazado",
    canceled: "Cancelado",
  };

  return labels[value || ""] || value || "-";
};

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};
