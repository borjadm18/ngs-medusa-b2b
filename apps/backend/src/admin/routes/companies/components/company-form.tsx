import { Button, Drawer, Input, Label, Select, Text } from "@medusajs/ui";
import { AdminUpdateCompany } from "../../../../types";
import { useState } from "react";
import { useRegions } from "../../../hooks/api";

export function CompanyForm({
  company,
  handleSubmit,
  loading,
  error,
}: {
  company?: AdminUpdateCompany;
  handleSubmit: (data: AdminUpdateCompany) => Promise<void>;
  loading: boolean;
  error: Error | null;
}) {
  const [formData, setFormData] = useState<AdminUpdateCompany>(
    company || ({} as AdminUpdateCompany)
  );

  const { regions, isPending: regionsLoading } = useRegions();

  const currencyCodes = regions?.map((region) => region.currency_code);
  const countries = regions?.flatMap((region) => region.countries);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCurrencyChange = (value: string) => {
    setFormData({ ...formData, currency_code: value });
  };

  const handleCountryChange = (value: string) => {
    setFormData({ ...formData, country: value });
  };

  const handleOnboardingStatusChange = (value: string) => {
    setFormData({ ...formData, onboarding_status: value as any });
  };

  const handlePaymentTermsChange = (value: string) => {
    setFormData({ ...formData, payment_terms: value as any });
  };

  return (
    <form>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-2">
          <Label size="xsmall">Nombre de empresa</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Medusa"
          />
          <Label size="xsmall">Teléfono de empresa</Label>
          <Input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="1234567890"
          />
          <Label size="xsmall">Email de empresa</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="medusa@medusa.com"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label size="xsmall">CIF / VAT</Label>
              <Input
                type="text"
                name="tax_id"
                value={formData.tax_id || ""}
                onChange={handleChange}
                placeholder="ESB00000000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall">Sector</Label>
              <Input
                type="text"
                name="sector"
                value={formData.sector || ""}
                onChange={handleChange}
                placeholder="instalador"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label size="xsmall">Estado onboarding</Label>
              <Select
                value={formData.onboarding_status || "approved"}
                onValueChange={handleOnboardingStatusChange}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="pending">Pendiente</Select.Item>
                  <Select.Item value="approved">Aprobada</Select.Item>
                  <Select.Item value="rejected">Denegada</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall">Condiciones pago</Label>
              <Select
                value={formData.payment_terms || "bank_transfer"}
                onValueChange={handlePaymentTermsChange}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="prepaid">Pago anticipado</Select.Item>
                  <Select.Item value="bank_transfer">Transferencia</Select.Item>
                  <Select.Item value="net_30">Crédito 30 días</Select.Item>
                  <Select.Item value="net_60">Crédito 60 días</Select.Item>
                  <Select.Item value="credit">Crédito comercial</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
          <Label size="xsmall">Dirección de empresa</Label>
          <Input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="1234 Main St"
          />
          <Label size="xsmall">Ciudad</Label>
          <Input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder="New York"
          />
          <Label size="xsmall">Provincia / estado</Label>
          <Input
            type="text"
            name="state"
            value={formData.state || ""}
            onChange={handleChange}
            placeholder="NY"
          />
          <Label size="xsmall">Código postal</Label>
          <Input
            type="text"
            name="zip"
            value={formData.zip || ""}
            onChange={handleChange}
            placeholder="10001"
          />
          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-2 w-1/2">
              <Label size="xsmall">País</Label>
              <Select
                name="country"
                value={formData.country || ""}
                onValueChange={handleCountryChange}
                disabled={regionsLoading}
              >
                <Select.Trigger disabled={regionsLoading}>
                  <Select.Value placeholder="Selecciona país" />
                </Select.Trigger>
                <Select.Content className="z-50">
                  {countries?.map((country) => (
                    <Select.Item
                      key={country?.iso_2 || ""}
                      value={country?.iso_2 || ""}
                    >
                      {country?.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <Label size="xsmall">Moneda</Label>

              <Select
                name="currency_code"
                value={formData.currency_code || ""}
                onValueChange={handleCurrencyChange}
                defaultValue={currencyCodes?.[0]}
                disabled={regionsLoading}
              >
                <Select.Trigger disabled={regionsLoading}>
                  <Select.Value placeholder="Selecciona moneda" />
                </Select.Trigger>

                <Select.Content className="z-50">
                  {currencyCodes?.map((currencyCode) => (
                    <Select.Item key={currencyCode} value={currencyCode}>
                      {currencyCode.toUpperCase()}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
          <Label size="xsmall">URL del logo</Label>
          <Input
            type="text"
            name="logo_url"
            value={formData.logo_url || ""}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cancelar</Button>
        </Drawer.Close>
        <Button
          isLoading={loading}
          onClick={async () => await handleSubmit(formData)}
        >
          Guardar
        </Button>
        {error && (
          <Text className="txt-compact-small text-ui-fg-warning">
            Error: {error?.message}
          </Text>
        )}
      </Drawer.Footer>
    </form>
  );
}
