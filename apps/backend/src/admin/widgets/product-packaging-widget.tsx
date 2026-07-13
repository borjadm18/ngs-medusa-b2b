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
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { sdk } from "../lib/client";
import {
  AdminProductPackaging,
  AdminUpsertProductPackaging,
  useBulkUpsertProductPackaging,
  useProductPackaging,
  useUpsertProductPackaging,
} from "../hooks/api/product-packaging";

type ProductVariant = {
  id: string;
  title?: string;
  sku?: string | null;
};

type CsvImportRow = {
  rowNumber: number;
  variant?: ProductVariant;
  packaging?: AdminUpsertProductPackaging;
  errors: string[];
  raw: Record<string, string>;
};

type CsvImportPreview = {
  filename: string;
  rows: CsvImportRow[];
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

const normalizeHeader = (value: string) => value.trim().toLowerCase();

const parsePositiveInteger = (value: string, fallback: number) => {
  if (!value.trim()) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parsePositiveNumberOrNull = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const ProductPackagingWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [form, setForm] = useState<AdminUpsertProductPackaging>(DEFAULT_FORM);
  const [importPreview, setImportPreview] =
    useState<CsvImportPreview | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

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
  const bulkUpsertPackaging = useBulkUpsertProductPackaging({
    onSuccess: () => {
      toast.success("Reglas de packaging actualizadas");
      setSelectedVariant(null);
      setImportPreview(null);
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo actualizar el packaging");
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

  const normalizedForm = (variantId: string): AdminUpsertProductPackaging => ({
    ...form,
    variant_id: variantId,
    minimum_order_quantity: Math.max(
      Math.floor(Number(form.minimum_order_quantity)),
      1
    ),
    quantity_increment: Math.max(Math.floor(Number(form.quantity_increment)), 1),
    units_per_box: Math.max(Math.floor(Number(form.units_per_box)), 1),
    boxes_per_pallet: form.boxes_per_pallet
      ? Math.max(Math.floor(Number(form.boxes_per_pallet)), 1)
      : null,
    package_weight: form.package_weight ? Number(form.package_weight) : null,
    package_dimensions: form.package_dimensions || null,
  });

  const handleSaveForAllVariants = () => {
    if (!variants.length) {
      return;
    }

    bulkUpsertPackaging.mutate(
      variants.map((variant) => normalizedForm(variant.id))
    );
  };

  const handleExportCsv = () => {
    const rows = variants.map((variant) => {
      const packaging = packagingByVariantId[variant.id] || {
        ...DEFAULT_FORM,
        variant_id: variant.id,
      };

      return [
        variant.sku || "",
        variant.id,
        packaging.sales_unit,
        packaging.minimum_order_quantity,
        packaging.quantity_increment,
        packaging.units_per_box,
        packaging.boxes_per_pallet ?? "",
        packaging.package_weight ?? "",
        packaging.package_dimensions ?? "",
      ];
    });
    const csv = [
      [
        "sku",
        "variant_id",
        "sales_unit",
        "minimum_order_quantity",
        "quantity_increment",
        "units_per_box",
        "boxes_per_pallet",
        "package_weight",
        "package_dimensions",
      ],
      ...rows,
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `product-packaging-${data.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buildImportPreview = (filename: string, text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      toast.error("El CSV esta vacio");
      return;
    }

    const [headerLine, ...lines] = trimmedText.split(/\r?\n/);
    const headers = parseCsvRow(headerLine).map(normalizeHeader);
    const variantById = variants.reduce<Record<string, ProductVariant>>(
      (acc, variant) => {
        acc[variant.id] = variant;
        return acc;
      },
      {}
    );
    const variantBySku = variants.reduce<Record<string, ProductVariant>>(
      (acc, variant) => {
        if (variant.sku) {
          acc[variant.sku] = variant;
        }
        return acc;
      },
      {}
    );

    const rows = lines
      .filter((line) => line.trim())
      .map(parseCsvRow)
      .map<CsvImportRow>((values, index) => {
        const raw = headers.reduce<Record<string, string>>(
          (acc, header, valueIndex) => {
            acc[header] = values[valueIndex] || "";
            return acc;
          },
          {}
        );
        const errors: string[] = [];
        const variant =
          variantById[raw.variant_id] ||
          (raw.sku ? variantBySku[raw.sku] : undefined);

        if (!variant) {
          errors.push("No coincide con ninguna variante por variant_id o sku");
        }

        const salesUnit = raw.sales_unit === "box" ? "box" : "unit";
        if (raw.sales_unit && !["unit", "box"].includes(raw.sales_unit)) {
          errors.push("sales_unit debe ser unit o box");
        }

        const minimumOrderQuantity = parsePositiveInteger(
          raw.minimum_order_quantity || raw.minimo,
          1
        );
        const quantityIncrement = parsePositiveInteger(
          raw.quantity_increment || raw.multiplo,
          1
        );
        const unitsPerBox = parsePositiveInteger(
          raw.units_per_box || raw.uds_caja,
          1
        );
        const boxesPerPallet = parsePositiveInteger(
          raw.boxes_per_pallet,
          0
        );
        const packageWeight = parsePositiveNumberOrNull(raw.package_weight);

        if (!minimumOrderQuantity) {
          errors.push("minimum_order_quantity debe ser entero positivo");
        }
        if (!quantityIncrement) {
          errors.push("quantity_increment debe ser entero positivo");
        }
        if (!unitsPerBox) {
          errors.push("units_per_box debe ser entero positivo");
        }
        if (raw.boxes_per_pallet && boxesPerPallet === null) {
          errors.push("boxes_per_pallet debe ser entero positivo");
        }
        if (raw.package_weight && packageWeight === null) {
          errors.push("package_weight debe ser numero positivo");
        }

        return {
          rowNumber: index + 2,
          variant,
          raw,
          errors,
          packaging:
            variant &&
            minimumOrderQuantity &&
            quantityIncrement &&
            unitsPerBox
              ? {
                  variant_id: variant.id,
                  sales_unit: salesUnit,
                  minimum_order_quantity: minimumOrderQuantity,
                  quantity_increment: quantityIncrement,
                  units_per_box: unitsPerBox,
                  boxes_per_pallet: boxesPerPallet || null,
                  package_weight: packageWeight,
                  package_dimensions: raw.package_dimensions || null,
                }
              : undefined,
        };
      });

    setImportPreview({
      filename,
      rows,
    });
  };

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    buildImportPreview(file.name, text);

    event.target.value = "";
  };

  const validImportRows = useMemo(
    () =>
      (importPreview?.rows || []).filter(
        (row) => row.packaging && row.errors.length === 0
      ),
    [importPreview?.rows]
  );

  const invalidImportRows = useMemo(
    () => (importPreview?.rows || []).filter((row) => row.errors.length > 0),
    [importPreview?.rows]
  );

  const handleConfirmImport = () => {
    const payload = validImportRows
      .map((row) => row.packaging)
      .filter(Boolean) as AdminUpsertProductPackaging[];

    if (!payload.length) {
      toast.error("No hay filas validas para importar");
      return;
    }

    bulkUpsertPackaging.mutate(payload);
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
        <div className="flex items-center gap-x-2">
          <input
            ref={importInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportCsv}
          />
          <Button
            size="small"
            variant="secondary"
            disabled={!variants.length || bulkUpsertPackaging.isPending}
            onClick={() => importInputRef.current?.click()}
          >
            Importar CSV
          </Button>
          <Button
            size="small"
            variant="secondary"
            disabled={!variants.length}
            onClick={handleExportCsv}
          >
            Exportar CSV
          </Button>
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
              <Button
                size="small"
                variant="secondary"
                onClick={handleSaveForAllVariants}
                isLoading={bulkUpsertPackaging.isPending}
              >
                Aplicar a todas
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer
        open={!!importPreview}
        onOpenChange={(open) => {
          if (!open) {
            setImportPreview(null);
          }
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              Preview import CSV: {importPreview?.filename || ""}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-auto p-4">
            <div className="grid gap-3 small:grid-cols-3">
              <ImportSummaryCard label="Filas" value={importPreview?.rows.length || 0} />
              <ImportSummaryCard label="Validas" value={validImportRows.length} />
              <ImportSummaryCard label="Con errores" value={invalidImportRows.length} />
            </div>

            {invalidImportRows.length ? (
              <div className="grid gap-2 rounded-lg border border-ui-border-error p-3">
                <Text size="small" leading="compact" weight="plus">
                  Errores detectados
                </Text>
                <div className="grid gap-2">
                  {invalidImportRows.slice(0, 12).map((row) => (
                    <div key={`error-${row.rowNumber}`}>
                      <Text size="small" leading="compact" weight="plus">
                        Fila {row.rowNumber}: {row.raw.sku || row.raw.variant_id || "sin identificador"}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {row.errors.join("; ")}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Text size="small" leading="compact" weight="plus">
                Filas que se aplicaran
              </Text>
              {validImportRows.length ? (
                <div className="overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b bg-ui-bg-subtle px-3 py-2">
                    <Text size="small" weight="plus">Variante</Text>
                    <Text size="small" weight="plus">Venta</Text>
                    <Text size="small" weight="plus">Minimo</Text>
                    <Text size="small" weight="plus">Caja</Text>
                  </div>
                  {validImportRows.slice(0, 20).map((row) => (
                    <div
                      key={`valid-${row.rowNumber}`}
                      className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b px-3 py-2 last:border-b-0"
                    >
                      <Text size="small" leading="compact">
                        {row.variant?.sku || row.variant?.title || row.variant?.id}
                      </Text>
                      <Text size="small" leading="compact">
                        {row.packaging?.sales_unit}
                      </Text>
                      <Text size="small" leading="compact">
                        {row.packaging?.minimum_order_quantity}
                      </Text>
                      <Text size="small" leading="compact">
                        {row.packaging?.units_per_box} uds
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <Text size="small" className="text-ui-fg-subtle">
                  No hay filas validas para aplicar.
                </Text>
              )}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={bulkUpsertPackaging.isPending}
                >
                  Cancelar
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={handleConfirmImport}
                isLoading={bulkUpsertPackaging.isPending}
                disabled={!validImportRows.length}
              >
                Aplicar {validImportRows.length} filas
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

const ImportSummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="rounded-lg border bg-ui-bg-subtle p-3">
    <Text size="small" leading="compact" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="large" weight="plus">
      {value}
    </Text>
  </div>
);

const parseCsvRow = (row: string) => {
  const result: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    const next = row[index + 1];

    if (character === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      result.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current);
  return result.map((value) => value.trim());
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
