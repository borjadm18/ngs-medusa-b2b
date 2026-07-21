import {
  Button,
  CurrencyInput,
  Drawer,
  Input,
  Label,
  Select,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import { AdminCreateEmployee, QueryCompany } from "../../../../../types";
import { CoolSwitch } from "../../../../components/common";
import { currencySymbolMap } from "../../../../utils";

export function EmployeesCreateForm({
  handleSubmit,
  loading,
  error,
  company,
}: {
  handleSubmit: (data: AdminCreateEmployee) => Promise<void>;
  loading: boolean;
  error: Error | null;
  company: QueryCompany;
}) {
  const [formData, setFormData] = useState<
    Omit<AdminCreateEmployee, "spending_limit"> & {
      spending_limit: string;
    }
  >({
    company_id: company.id,
    is_admin: false,
    role: "buyer" as any,
    status: "active" as any,
    spending_limit: "0",
    customer_id: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const spendingLimit = formData.spending_limit
      ? parseInt(formData.spending_limit)
      : 0;

    const data = {
      ...formData,
      spending_limit: spendingLimit,
    };

    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="flex flex-col p-4 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Datos del usuario</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Nombre
            </Label>
            <Input
              type="text"
              name="first_name"
              onChange={handleChange}
              placeholder="Laura"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Apellidos
            </Label>
            <Input
              type="text"
              name="last_name"
              onChange={handleChange}
              placeholder="Garcia"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="laura.garcia@empresa.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Telefono
            </Label>
            <Input
              type="text"
              name="phone"
              onChange={handleChange}
              placeholder="0612345678"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Permisos</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Limite de gasto ({company.currency_code?.toUpperCase() || "EUR"})
            </Label>
            <CurrencyInput
              symbol={currencySymbolMap[company.currency_code || "USD"]}
              code={company.currency_code || "USD"}
              type="text"
              name="spending_limit"
              value={formData.spending_limit ? formData.spending_limit : ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spending_limit: e.target.value.replace(/[^0-9]/g, ""),
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
              value={formData.role || "buyer"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  role: value as any,
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
              Acceso administrador
            </Label>
            <CoolSwitch
              fieldName="is_admin"
              label="Es administrador"
              description="Permite gestionar datos de empresa y permisos."
              checked={formData.is_admin || false}
              onChange={(checked) =>
                setFormData({ ...formData, is_admin: checked })
              }
              tooltip="Los administradores pueden gestionar la empresa y los permisos de usuarios."
            />
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
