import {
  Button,
  Container,
  CurrencyInput,
  Drawer,
  Label,
  Select,
  Table,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import {
  AdminUpdateEmployee,
  QueryCompany,
  QueryEmployee,
} from "../../../../../types";
import { CoolSwitch } from "../../../../components/common";
import { currencySymbolMap } from "../../../../utils";

export function EmployeesUpdateForm({
  company,
  employee,
  handleSubmit,
  loading,
  error,
}: {
  employee: QueryEmployee;
  company: QueryCompany;
  handleSubmit: (data: AdminUpdateEmployee) => Promise<void>;
  loading: boolean;
  error: Error | null;
}) {
  const [formData, setFormData] = useState<{
    spending_limit: string;
    is_admin: boolean;
    role: string;
    status: string;
  }>({
    spending_limit: employee?.spending_limit?.toString() || "0",
    is_admin: employee?.is_admin || false,
    role: employee?.role || "buyer",
    status: employee?.status || "active",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const spendingLimit = formData.spending_limit
      ? Number(formData.spending_limit)
      : undefined;

    const data = {
      ...formData,
      id: employee?.id,
      spending_limit: spendingLimit,
      raw_spending_limit: {
        value: spendingLimit,
      },
    };

    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="h2-core">Datos del usuario</h2>
              <a
                href={`/app/customers/${employee?.customer!.id}/edit`}
                className="txt-compact-small text-ui-fg-interactive hover:text-ui-fg-interactive-hover self-end"
              >
                Editar ficha de cliente
              </a>
            </div>
            <Container className="p-0 overflow-hidden">
              <Table>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell className="font-medium font-sans txt-compact-small">
                      Nombre
                    </Table.Cell>
                    <Table.Cell>
                      {employee?.customer!.first_name}{" "}
                      {employee?.customer!.last_name}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className="font-medium font-sans txt-compact-small">
                      Email
                    </Table.Cell>
                    <Table.Cell>{employee?.customer!.email}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className="font-medium font-sans txt-compact-small">
                      Telefono
                    </Table.Cell>
                    <Table.Cell>{employee?.customer!.phone}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className="font-medium font-sans txt-compact-small">
                      Empresa
                    </Table.Cell>
                    <Table.Cell>{company.name}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Container>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="h2-core">Permisos</h2>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Limite de gasto ({company.currency_code?.toUpperCase() || "EUR"})
              </Label>
              <CurrencyInput
                symbol={currencySymbolMap[company.currency_code || "USD"]}
                code={company.currency_code || "USD"}
                name="spending_limit"
                value={formData.spending_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spending_limit: e.target.value.replace(/[^0-9.]/g, ""),
                  })
                }
                placeholder="1000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Rol B2B
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    role: value,
                    is_admin: value === "company_admin",
                  })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="buyer">Comprador</Select.Item>
                  <Select.Item value="approver">Aprobador</Select.Item>
                  <Select.Item value="company_admin">Admin empresa</Select.Item>
                  <Select.Item value="readonly">Solo lectura</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Estado
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="invited">Invitado</Select.Item>
                  <Select.Item value="active">Activo</Select.Item>
                  <Select.Item value="disabled">Desactivado</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Acceso administrador
              </Label>
              <CoolSwitch
                fieldName="is_admin"
                label="Es administrador"
                description="Permite gestionar datos de empresa y permisos."
                checked={formData.is_admin}
                onChange={(checked) =>
                  setFormData({ ...formData, is_admin: checked })
                }
                tooltip="Los administradores pueden gestionar la empresa y los permisos de usuarios."
              />
            </div>
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cancelar</Button>
        </Drawer.Close>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        {error && <Text className="text-red-500">{error.message}</Text>}
      </Drawer.Footer>
    </form>
  );
}
