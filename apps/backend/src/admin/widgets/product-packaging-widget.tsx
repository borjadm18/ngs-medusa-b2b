import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { PencilSquare } from "@medusajs/icons";
import type { AdminProduct, DetailWidgetProps } from "@medusajs/types";
import {
  Badge,
  Button,
  Container,
  Drawer,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { sdk } from "../lib/client";
import {
  AdminProductPackaging,
  AdminUpsertProductPackaging,
  useProductPackaging,
  useUpsertProductPackaging,
} from "../hooks/api/product-packaging";

type ProductVariant = {
  id: string;
  title?: string;
  sku?: string | null;
};

const DEFAULT_FORM: AdminUpsertProductPackaging = {
  variant_id: "",
  sales_unit: "unit",
  minimum_order_quantity: 1,
  quantity_increment: 1,
  units_per_box: 1,
  boxes_per_pallet: null,
  package_weight: null,
  package_dimensions: null,
};

const toNumberOrNull = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const ProductPackagingWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [form, setForm] = useState<AdminUpsertProductPackaging>(DEFAULT_FORM);

  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["admin-product-packaging-product", data.id],
    queryFn: () =>
      sdk.admin.product.retrieve(data.id, {
        fields: "+variants.*",
      }),
  });

  const variants = useMemo<ProductVariant[]>(() => {
    return ((productData as any)?.product?.variants || []) as ProductVariant[];
  }, [productData]);

  const variantIds = useMemo(
    () => variants.map((variant) => variant.id).filter(Boolean),
    [variants]
  );

  const { data: packagingData, isLoading: isPackagingLoading } =
    useProductPackaging(variantIds, {
      enabled: variantIds.length > 0,
    });

  const packagingByVariantId = useMemo(() => {
    return (packagingData?.packaging || []).reduce<
      Record<string, AdminProductPackaging>
    >((acc, item) => {
      acc[item.variant_id] = item;
      return acc;
    }, {});
  }, [packagingData]);

  const upsertPackaging = useUpsertProductPackaging({
    onSuccess: () => {
      toast.success("Packaging B2B guardado");
      setSelectedVariant(null);
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo guardar el packaging");
    },
  });

  useEffect(() => {
    if (!selectedVariant) {
      return;
    }

    const existing = packagingByVariantId[selectedVariant.id];
    setForm({
      ...DEFAULT_FORM,
      ...existing,
      variant_id: selectedVariant.id,
    });
  }, [packagingByVariantId, selectedVariant]);

  const handleSave = () => {
    if (!form.variant_id) {
      return;
    }

    upsertPackaging.mutate({
      ...form,
      minimum_order_quantity: Math.max(
        Math.floor(Number(form.minimum_order_quantity)),
        1
      ),
      quantity_increment: Math.max(Math.floor(Number(form.quantity_increment)), 1),
      units_per_box: Math.max(Math.floor(Number(form.units_per_box)), 1),
      boxes_per_pallet: form.boxes_per_pallet
        ? Math.max(Math.floor(Number(form.boxes_per_pallet)), 1)
        : null,
      package_weight: form.package_weight
        ? Number(form.package_weight)
        : null,
      package_dimensions: form.package_dimensions || null,
    });
  };

  const isLoading = isProductLoading || isPackagingLoading;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Packaging B2B
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Reglas de venta por unidad, caja, minimos y multiplos por variante.
          </Text>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center px-6 py-8">
          <Text size="small" className="text-ui-fg-subtle">
            Cargando reglas de packaging...
          </Text>
        </div>
      ) : variants.length ? (
        <div className="divide-y">
          {variants.map((variant) => {
            const packaging = packagingByVariantId[variant.id];

            return (
              <div
                key={variant.id}
                className="grid gap-3 px-6 py-4 small:grid-cols-[minmax(0,1fr)_auto] small:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text size="small" leading="compact" weight="plus">
                      {variant.title || "Variante"}
                    </Text>
                    {variant.sku && <Badge size="2xsmall">{variant.sku}</Badge>}
                  </div>
                  <Text
                    size="small"
                    leading="compact"
                    className="mt-1 text-ui-fg-subtle"
                  >
                    {packaging
                      ? `${packaging.units_per_box} uds/caja - minimo ${packaging.minimum_order_quantity} - multiplo ${packaging.quantity_increment}`
                      : "Sin regla especifica; se usan valores por defecto."}
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setSelectedVariant(variant)}
                >
                  <PencilSquare />
                  Editar
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Este producto no tiene variantes editables.
          </Text>
        </div>
      )}

      <Drawer
        open={!!selectedVariant}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVariant(null);
          }
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              Packaging B2B: {selectedVariant?.title || "variante"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-auto p-4">
            <div className="flex flex-col gap-y-2">
              <Label>Unidad de venta</Label>
              <Select
                value={form.sales_unit}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    sales_unit: value as "unit" | "box",
                  }))
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="unit">Unidad</Select.Item>
                  <Select.Item value="box">Caja</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <NumberField
              label="Pedido minimo (uds)"
              value={form.minimum_order_quantity}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  minimum_order_quantity: Number(value) || 1,
                }))
              }
            />
            <NumberField
              label="Multiplo obligatorio"
              value={form.quantity_increment}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  quantity_increment: Number(value) || 1,
                }))
              }
            />
            <NumberField
              label="Unidades por caja"
              value={form.units_per_box}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  units_per_box: Number(value) || 1,
                }))
              }
            />
            <NumberField
              label="Cajas por pallet"
              value={form.boxes_per_pallet ?? ""}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  boxes_per_pallet: toNumberOrNull(value),
                }))
              }
            />
            <NumberField
              label="Peso embalado"
              value={form.package_weight ?? ""}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  package_weight: toNumberOrNull(value),
                }))
              }
            />
            <div className="flex flex-col gap-y-2">
              <Label>Dimensiones embalaje</Label>
              <Input
                value={form.package_dimensions ?? ""}
                placeholder="600 x 355 x 350 mm"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    package_dimensions: event.target.value,
                  }))
                }
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={upsertPackaging.isPending}
                >
                  Cancelar
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={handleSave}
                isLoading={upsertPackaging.isPending}
              >
                Guardar
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductPackagingWidget;
