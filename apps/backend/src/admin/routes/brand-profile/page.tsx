import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Buildings } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Label,
  Text,
  Textarea,
  Toaster,
  toast,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";
import {
  BrandProfileContent,
  DEFAULT_BRAND_PROFILE_CONTENT,
} from "../../../modules/brand-profile/defaults";
import {
  useBrandProfileContent,
  useUpdateBrandProfileContent,
} from "../../hooks/api/brand-profile";

const toPrettyJson = (value: unknown) => JSON.stringify(value, null, 2);

const BrandProfile = () => {
  const { data, isPending } = useBrandProfileContent();
  const [jsonValue, setJsonValue] = useState(
    toPrettyJson(DEFAULT_BRAND_PROFILE_CONTENT)
  );

  const parsedProfile = useMemo(() => {
    try {
      return JSON.parse(jsonValue) as BrandProfileContent;
    } catch {
      return null;
    }
  }, [jsonValue]);

  const updateBrandProfile = useUpdateBrandProfileContent({
    onSuccess: () => toast.success("Perfil de marca actualizado"),
    onError: (error) =>
      toast.error(error.message || "No se pudo guardar el perfil de marca"),
  });

  useEffect(() => {
    if (data?.brand_profile) {
      setJsonValue(toPrettyJson(data.brand_profile));
    }
  }, [data?.brand_profile]);

  const handleSubmit = () => {
    if (!parsedProfile) {
      toast.error("El JSON del perfil de marca no es valido");
      return;
    }

    updateBrandProfile.mutate(parsedProfile);
  };

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <Heading className="font-sans font-medium h1-core">
              Brand profile
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Edita marca, SEO, navegacion, footer y fallbacks del storefront.
            </Text>
          </div>
          <Button
            size="small"
            onClick={handleSubmit}
            isLoading={updateBrandProfile.isPending}
            disabled={isPending}
          >
            Guardar cambios
          </Button>
        </div>

        <div className="grid gap-6 p-6 small:grid-cols-[1fr_360px]">
          <div className="grid gap-2">
            <Label>Perfil JSON</Label>
            <Textarea
              rows={32}
              value={jsonValue}
              onChange={(event) => setJsonValue(event.target.value)}
              className="font-mono"
            />
            <Text size="small" className="text-ui-fg-subtle">
              El siguiente paso sera convertir esto en formularios por seccion,
              pero esta version ya permite activar clientes sin redeploy.
            </Text>
          </div>

          <div className="h-fit rounded-lg border bg-ui-bg-base overflow-hidden">
            <div className="border-b p-4">
              <Text size="small" weight="plus">
                Vista rapida
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Preview de identidad y navegacion.
              </Text>
            </div>
            <div className="grid gap-4 p-4">
              {parsedProfile ? (
                <>
                  <div
                    className="rounded-lg border p-4"
                    style={{
                      background: parsedProfile.brand.colors.background,
                      color: parsedProfile.brand.colors.foreground,
                      borderColor: parsedProfile.brand.colors.border,
                    }}
                  >
                    <Text weight="plus">{parsedProfile.brand.name}</Text>
                    <Text size="small" className="mt-1">
                      {parsedProfile.brand.tagline}
                    </Text>
                  </div>
                  <PreviewList
                    title="Navegacion"
                    items={parsedProfile.navigation.main.map(
                      (link) => `${link.label} -> ${link.href}`
                    )}
                  />
                  <PreviewList
                    title="Footer"
                    items={parsedProfile.footer.columns.map(
                      (column) => `${column.title} (${column.links.length})`
                    )}
                  />
                  <PreviewList
                    title="SEO"
                    items={[
                      parsedProfile.seo.title,
                      parsedProfile.seo.description,
                    ]}
                  />
                </>
              ) : (
                <Text size="small" className="text-ui-fg-error">
                  JSON invalido
                </Text>
              )}
            </div>
          </div>
        </div>
      </Container>
      <Toaster />
    </>
  );
};

const PreviewList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <Text size="small" weight="plus">
      {title}
    </Text>
    <div className="mt-2 grid gap-1">
      {items.map((item) => (
        <Text key={item} size="small" className="text-ui-fg-subtle">
          {item}
        </Text>
      ))}
    </div>
  </div>
);

export const config = defineRouteConfig({
  label: "Brand profile",
  icon: Buildings,
});

export default BrandProfile;
