import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
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

type HomepageFormState = Omit<
  HomepageContent,
  "metrics" | "trustBlocks" | "capabilityBlocks" | "detailBlocks" | "operations"
> & {
  metricsJson: string;
  trustBlocksJson: string;
  capabilityBlocksJson: string;
  detailBlocksJson: string;
  operationsJson: string;
};

const toPrettyJson = (value: unknown) => JSON.stringify(value, null, 2);

const toFormState = (content: HomepageContent): HomepageFormState => ({
  heroBadgePrimary: content.heroBadgePrimary,
  heroBadgeSecondary: content.heroBadgeSecondary,
  heroTitle: content.heroTitle,
  heroBody: content.heroBody,
  primaryCtaLabel: content.primaryCtaLabel,
  primaryCtaHref: content.primaryCtaHref,
  secondaryCtaLabel: content.secondaryCtaLabel,
  secondaryCtaHref: content.secondaryCtaHref,
  heroImage: content.heroImage,
  heroImageAlt: content.heroImageAlt,
  heroImageEyebrow: content.heroImageEyebrow,
  heroImageTitle: content.heroImageTitle,
  capabilityEyebrow: content.capabilityEyebrow,
  capabilityTitle: content.capabilityTitle,
  categoryEyebrow: content.categoryEyebrow,
  categoryTitle: content.categoryTitle,
  detailEyebrow: content.detailEyebrow,
  detailTitle: content.detailTitle,
  detailBody: content.detailBody,
  detailCtaLabel: content.detailCtaLabel,
  detailCtaHref: content.detailCtaHref,
  catalogEyebrow: content.catalogEyebrow,
  catalogTitle: content.catalogTitle,
  operationsEyebrow: content.operationsEyebrow,
  operationsTitle: content.operationsTitle,
  metricsJson: toPrettyJson(content.metrics),
  trustBlocksJson: toPrettyJson(content.trustBlocks),
  capabilityBlocksJson: toPrettyJson(content.capabilityBlocks),
  detailBlocksJson: toPrettyJson(content.detailBlocks),
  operationsJson: toPrettyJson(content.operations),
});

const parseJsonField = <T,>(value: string, label: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`${label} contiene JSON invalido`);
  }
};

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

  const handleSubmit = () => {
    try {
      const content: HomepageContent = {
        ...form,
        metrics: parseJsonField(form.metricsJson, "Metricas"),
        trustBlocks: parseJsonField(form.trustBlocksJson, "Banda superior"),
        capabilityBlocks: parseJsonField(
          form.capabilityBlocksJson,
          "Bloques comerciales"
        ),
        detailBlocks: parseJsonField(form.detailBlocksJson, "Bloques visuales"),
        operations: parseJsonField(form.operationsJson, "Operativa B2B"),
      };

      delete (content as any).metricsJson;
      delete (content as any).trustBlocksJson;
      delete (content as any).capabilityBlocksJson;
      delete (content as any).detailBlocksJson;
      delete (content as any).operationsJson;

      updateHomepage.mutate(content);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "JSON invalido");
    }
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
              <TextField
                label="Imagen hero"
                value={form.heroImage}
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

            <Section title="Listas y bloques JSON">
              <TextAreaField
                label="Metricas"
                value={form.metricsJson}
                rows={7}
                onChange={(value) => updateField("metricsJson", value)}
              />
              <TextAreaField
                label="Banda superior"
                value={form.trustBlocksJson}
                rows={10}
                onChange={(value) => updateField("trustBlocksJson", value)}
              />
              <TextAreaField
                label="Bloques comerciales"
                value={form.capabilityBlocksJson}
                rows={14}
                onChange={(value) => updateField("capabilityBlocksJson", value)}
              />
              <TextAreaField
                label="Bloques visuales"
                value={form.detailBlocksJson}
                rows={16}
                onChange={(value) => updateField("detailBlocksJson", value)}
              />
              <TextAreaField
                label="Operativa B2B"
                value={form.operationsJson}
                rows={8}
                onChange={(value) => updateField("operationsJson", value)}
              />
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
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-4 rounded-lg border p-4">
    <Text size="small" leading="compact" weight="plus">
      {title}
    </Text>
    <div className="grid gap-3">{children}</div>
  </div>
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
