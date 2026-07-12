import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo, Plus, Trash } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Label,
  Text,
  Textarea,
  Toaster,
  toast,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HomepageContent,
} from "../../../modules/homepage/defaults";
import {
  useHomepageContent,
  useUpdateHomepageContent,
} from "../../hooks/api/homepage";
import { AssetPickerField } from "../../components/assets/asset-picker-field";

type HomepageFormState = HomepageContent;

const toFormState = (content: HomepageContent): HomepageFormState => ({
  ...content,
  metrics: content.metrics.map((item) => ({ ...item })),
  trustBlocks: content.trustBlocks.map((item) => ({ ...item })),
  capabilityBlocks: content.capabilityBlocks.map((item) => ({ ...item })),
  detailBlocks: content.detailBlocks.map((item) => ({ ...item })),
  operations: [...content.operations],
});

const Homepage = () => {
  const { data, isPending } = useHomepageContent();
  const [form, setForm] = useState<HomepageFormState>(
    toFormState(DEFAULT_HOMEPAGE_CONTENT)
  );

  const updateHomepage = useUpdateHomepageContent({
    onSuccess: () => toast.success("Homepage actualizada"),
    onError: (error) =>
      toast.error(error.message || "No se pudo guardar la homepage"),
  });

  useEffect(() => {
    if (data?.homepage) {
      setForm(toFormState(data.homepage));
    }
  }, [data?.homepage]);

  const heroPreview = useMemo(
    () => ({
      title: form.heroTitle,
      body: form.heroBody,
      image: form.heroImage,
    }),
    [form.heroBody, form.heroImage, form.heroTitle]
  );

  const updateField = (field: keyof HomepageFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateMetric = (
    index: number,
    field: keyof HomepageContent["metrics"][number],
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      metrics: current.metrics.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addMetric = () => {
    setForm((current) => ({
      ...current,
      metrics: [...current.metrics, { value: "Nuevo", label: "Texto" }],
    }));
  };

  const removeMetric = (index: number) => {
    setForm((current) => ({
      ...current,
      metrics: current.metrics.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateImageBlock = (
    collection: "trustBlocks" | "capabilityBlocks" | "detailBlocks",
    index: number,
    field: keyof HomepageContent["trustBlocks"][number],
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addImageBlock = (
    collection: "trustBlocks" | "capabilityBlocks" | "detailBlocks"
  ) => {
    setForm((current) => ({
      ...current,
      [collection]: [
        ...current[collection],
        { title: "Nuevo bloque", body: "Descripcion", image: "" },
      ],
    }));
  };

  const removeImageBlock = (
    collection: "trustBlocks" | "capabilityBlocks" | "detailBlocks",
    index: number
  ) => {
    setForm((current) => ({
      ...current,
      [collection]: current[collection].filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const updateOperation = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      operations: current.operations.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const addOperation = () => {
    setForm((current) => ({
      ...current,
      operations: [...current.operations, "Nueva capacidad operativa"],
    }));
  };

  const removeOperation = (index: number) => {
    setForm((current) => ({
      ...current,
      operations: current.operations.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const handleSubmit = () => {
    if (!form.metrics.length) {
      toast.error("Anade al menos una metrica");
      return;
    }

    if (!form.trustBlocks.length || !form.capabilityBlocks.length) {
      toast.error("Anade al menos un bloque comercial");
      return;
    }

    updateHomepage.mutate(form);
  };

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <Heading className="font-sans font-medium h1-core">
              Homepage
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Edita textos, CTAs, bloques e imagenes de la home publica.
            </Text>
          </div>
          <Button
            size="small"
            onClick={handleSubmit}
            isLoading={updateHomepage.isPending}
            disabled={isPending}
          >
            Guardar cambios
          </Button>
        </div>

        <div className="grid gap-6 p-6 small:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <Section title="Hero principal">
              <TextField
                label="Badge 1"
                value={form.heroBadgePrimary}
                onChange={(value) => updateField("heroBadgePrimary", value)}
              />
              <TextField
                label="Badge 2"
                value={form.heroBadgeSecondary}
                onChange={(value) => updateField("heroBadgeSecondary", value)}
              />
              <TextAreaField
                label="Titulo"
                value={form.heroTitle}
                onChange={(value) => updateField("heroTitle", value)}
              />
              <TextAreaField
                label="Texto"
                value={form.heroBody}
                onChange={(value) => updateField("heroBody", value)}
              />
              <div className="grid gap-3 small:grid-cols-2">
                <TextField
                  label="CTA principal"
                  value={form.primaryCtaLabel}
                  onChange={(value) => updateField("primaryCtaLabel", value)}
                />
                <TextField
                  label="Link CTA principal"
                  value={form.primaryCtaHref}
                  onChange={(value) => updateField("primaryCtaHref", value)}
                />
                <TextField
                  label="CTA secundario"
                  value={form.secondaryCtaLabel}
                  onChange={(value) => updateField("secondaryCtaLabel", value)}
                />
                <TextField
                  label="Link CTA secundario"
                  value={form.secondaryCtaHref}
                  onChange={(value) => updateField("secondaryCtaHref", value)}
                />
              </div>
              <AssetPickerField
                label="Imagen hero"
                value={form.heroImage}
                preferredType="hero"
                onChange={(value) => updateField("heroImage", value)}
              />
              <TextField
                label="Alt imagen"
                value={form.heroImageAlt}
                onChange={(value) => updateField("heroImageAlt", value)}
              />
              <TextField
                label="Eyebrow sobre imagen"
                value={form.heroImageEyebrow}
                onChange={(value) => updateField("heroImageEyebrow", value)}
              />
              <TextAreaField
                label="Texto sobre imagen"
                value={form.heroImageTitle}
                onChange={(value) => updateField("heroImageTitle", value)}
              />
            </Section>

            <Section title="Secciones">
              <TextField
                label="Eyebrow capacidades"
                value={form.capabilityEyebrow}
                onChange={(value) => updateField("capabilityEyebrow", value)}
              />
              <TextAreaField
                label="Titulo capacidades"
                value={form.capabilityTitle}
                onChange={(value) => updateField("capabilityTitle", value)}
              />
              <TextField
                label="Eyebrow categorias"
                value={form.categoryEyebrow}
                onChange={(value) => updateField("categoryEyebrow", value)}
              />
              <TextField
                label="Titulo categorias"
                value={form.categoryTitle}
                onChange={(value) => updateField("categoryTitle", value)}
              />
              <TextField
                label="Eyebrow catalogo"
                value={form.catalogEyebrow}
                onChange={(value) => updateField("catalogEyebrow", value)}
              />
              <TextField
                label="Titulo catalogo"
                value={form.catalogTitle}
                onChange={(value) => updateField("catalogTitle", value)}
              />
              <TextField
                label="Eyebrow operativa"
                value={form.operationsEyebrow}
                onChange={(value) => updateField("operationsEyebrow", value)}
              />
              <TextAreaField
                label="Titulo operativa"
                value={form.operationsTitle}
                onChange={(value) => updateField("operationsTitle", value)}
              />
            </Section>

            <Section
              title="Metricas"
              actionLabel="Anadir metrica"
              onAction={addMetric}
            >
              <div className="grid gap-3">
                {form.metrics.map((metric, index) => (
                  <EditableRow
                    key={`metric-${index}`}
                    title={`Metrica ${index + 1}`}
                    onRemove={() => removeMetric(index)}
                    removeDisabled={form.metrics.length === 1}
                  >
                    <div className="grid gap-3 small:grid-cols-[160px_1fr]">
                      <TextField
                        label="Valor"
                        value={metric.value}
                        onChange={(value) => updateMetric(index, "value", value)}
                      />
                      <TextField
                        label="Texto"
                        value={metric.label}
                        onChange={(value) => updateMetric(index, "label", value)}
                      />
                    </div>
                  </EditableRow>
                ))}
              </div>
            </Section>

            <ImageBlockSection
              title="Banda superior"
              items={form.trustBlocks}
              profileId="ngs"
              onAdd={() => addImageBlock("trustBlocks")}
              onRemove={(index) => removeImageBlock("trustBlocks", index)}
              onChange={(index, field, value) =>
                updateImageBlock("trustBlocks", index, field, value)
              }
            />

            <ImageBlockSection
              title="Bloques comerciales"
              items={form.capabilityBlocks}
              profileId="ngs"
              onAdd={() => addImageBlock("capabilityBlocks")}
              onRemove={(index) => removeImageBlock("capabilityBlocks", index)}
              onChange={(index, field, value) =>
                updateImageBlock("capabilityBlocks", index, field, value)
              }
            />

            <ImageBlockSection
              title="Bloques visuales"
              items={form.detailBlocks}
              profileId="ngs"
              onAdd={() => addImageBlock("detailBlocks")}
              onRemove={(index) => removeImageBlock("detailBlocks", index)}
              onChange={(index, field, value) =>
                updateImageBlock("detailBlocks", index, field, value)
              }
            />

            <Section
              title="Operativa B2B"
              actionLabel="Anadir punto"
              onAction={addOperation}
            >
              <div className="grid gap-3">
                {form.operations.map((operation, index) => (
                  <EditableRow
                    key={`operation-${index}`}
                    title={`Punto ${index + 1}`}
                    onRemove={() => removeOperation(index)}
                    removeDisabled={form.operations.length === 1}
                  >
                    <TextAreaField
                      label="Texto"
                      value={operation}
                      rows={2}
                      onChange={(value) => updateOperation(index, value)}
                    />
                  </EditableRow>
                ))}
              </div>
            </Section>
          </div>

          <div className="h-fit border rounded-lg overflow-hidden bg-ui-bg-base">
            <div className="p-4 border-b">
              <Text size="small" weight="plus">
                Vista rapida
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Usa rutas como /images/ngs/home-hero-speakers.jpg o URLs
                absolutas.
              </Text>
            </div>
            <div className="p-4">
              <div className="aspect-video overflow-hidden rounded-lg border bg-ui-bg-subtle">
                {heroPreview.image ? (
                  <img
                    src={heroPreview.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <Text className="mt-4" weight="plus">
                {heroPreview.title}
              </Text>
              <Text size="small" className="mt-2 text-ui-fg-subtle">
                {heroPreview.body}
              </Text>
            </div>
          </div>
        </div>
      </Container>
      <Toaster />
    </>
  );
};

const Section = ({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="grid gap-4 rounded-lg border p-4">
    <div className="flex items-center justify-between gap-3">
      <Text size="small" leading="compact" weight="plus">
        {title}
      </Text>
      {onAction ? (
        <Button size="small" variant="secondary" onClick={onAction}>
          <Plus />
          {actionLabel}
        </Button>
      ) : null}
    </div>
    <div className="grid gap-3">{children}</div>
  </div>
);

const EditableRow = ({
  title,
  children,
  removeDisabled,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  removeDisabled?: boolean;
  onRemove: () => void;
}) => (
  <div className="grid gap-3 rounded-lg border bg-ui-bg-subtle p-3">
    <div className="flex items-center justify-between gap-3">
      <Text size="small" leading="compact" weight="plus">
        {title}
      </Text>
      <IconButton
        size="small"
        variant="transparent"
        disabled={removeDisabled}
        onClick={onRemove}
      >
        <Trash />
      </IconButton>
    </div>
    {children}
  </div>
);

const ImageBlockSection = ({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
  profileId = "ngs",
}: {
  title: string;
  items: HomepageContent["trustBlocks"];
  profileId?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof HomepageContent["trustBlocks"][number],
    value: string
  ) => void;
}) => (
  <Section title={title} actionLabel="Anadir bloque" onAction={onAdd}>
    <div className="grid gap-3">
      {items.map((item, index) => (
        <EditableRow
          key={`${title}-${index}`}
          title={`Bloque ${index + 1}`}
          onRemove={() => onRemove(index)}
          removeDisabled={items.length === 1}
        >
          <div className="grid gap-3">
            <div className="grid gap-3 small:grid-cols-2">
              <TextField
                label="Titulo"
                value={item.title}
                onChange={(value) => onChange(index, "title", value)}
              />
              <AssetPickerField
                label="Imagen"
                value={item.image}
                profileId={profileId}
                preferredType="homepage"
                onChange={(value) => onChange(index, "image", value)}
              />
            </div>
            <TextAreaField
              label="Texto"
              value={item.body}
              rows={3}
              onChange={(value) => onChange(index, "body", value)}
            />
          </div>
        </EditableRow>
      ))}
    </div>
  </Section>
);

const TextField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <Input value={value} onChange={(event) => onChange(event.target.value)} />
  </div>
);

const TextAreaField = ({
  label,
  value,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <Textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

export const config = defineRouteConfig({
  label: "Homepage",
  icon: Photo,
});

export default Homepage;
