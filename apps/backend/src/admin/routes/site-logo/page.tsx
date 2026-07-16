import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowUpTray, Image } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Toaster,
  toast,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  BrandProfileContent,
  DEFAULT_BRAND_PROFILE_CONTENT,
} from "../../../modules/brand-profile/defaults";
import { AssetPickerField } from "../../components/assets/asset-picker-field";
import {
  useBrandProfileContent,
  useUpdateBrandProfileContent,
} from "../../hooks/api/brand-profile";
import { useUploadAsset } from "../../hooks/api/assets";
import { resolveAdminAssetPreviewUrl } from "../../lib/assets";

const cloneProfile = (content: BrandProfileContent): BrandProfileContent =>
  JSON.parse(JSON.stringify(content));

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.split(",")[1] : value);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo subir el logo";

const SiteLogo = () => {
  const { data, isPending } = useBrandProfileContent();
  const [form, setForm] = useState<BrandProfileContent>(
    cloneProfile(DEFAULT_BRAND_PROFILE_CONTENT)
  );
  const [uploading, setUploading] = useState(false);

  const updateBrandProfile = useUpdateBrandProfileContent({
    onSuccess: () => toast.success("Logo actualizado"),
    onError: (error) =>
      toast.error(error.message || "No se pudo guardar el logo"),
  });

  const uploadAsset = useUploadAsset({
    onError: (error) =>
      toast.error(error.message || "No se pudo subir el logo"),
  });

  useEffect(() => {
    if (data?.brand_profile) {
      setForm(cloneProfile(data.brand_profile));
    }
  }, [data?.brand_profile]);

  const profileId = form.id || "ngs";
  const mainLogo = form.brand.logo.dark || form.brand.logo.light;

  const setLogo = (value: string) => {
    setForm((current) => ({
      ...current,
      brand: {
        ...current.brand,
        logo: {
          light: value,
          dark: value,
        },
      },
    }));
  };

  const saveProfile = (profile: BrandProfileContent = form) => {
    updateBrandProfile.mutate(profile);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const content_base64 = await readFileAsBase64(file);
      const { asset } = await uploadAsset.mutateAsync({
        label: file.name.replace(/\.[^.]+$/, ""),
        filename: file.name,
        mime_type: file.type || "image/png",
        content_base64,
        type: "logo",
        client_profile_id: profileId,
        alt: `${form.brand.name} logo`,
        tags: "logo, brand",
        sort_order: 0,
      });

      const nextProfile = {
        ...form,
        brand: {
          ...form.brand,
          logo: {
            light: asset.url,
            dark: asset.url,
          },
        },
      };

      setForm(nextProfile);
      saveProfile(nextProfile);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Container className="flex flex-col overflow-hidden p-0">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <Heading className="font-sans font-medium h1-core">
              Logo del sitio
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Cambia el logo principal que aparece en cabecera, checkout y
              footer.
            </Text>
          </div>
          <Button
            size="small"
            onClick={() => saveProfile()}
            isLoading={updateBrandProfile.isPending}
            disabled={isPending}
          >
            Guardar logo
          </Button>
        </div>

        <div className="grid gap-6 p-6 small:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6">
            <div className="grid gap-4 rounded-lg border p-4">
              <Text size="small" leading="compact" weight="plus">
                Subir logo nuevo
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Sube un PNG, JPG, SVG o WebP. Al terminar se guarda como logo
                principal.
              </Text>
              <Label>
                <span className="mb-2 block">Archivo</span>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  disabled={uploading || updateBrandProfile.isPending}
                  onChange={handleUpload}
                />
              </Label>
              <Button
                size="small"
                variant="secondary"
                disabled
                isLoading={uploading || uploadAsset.isPending}
              >
                <ArrowUpTray />
                {uploading || uploadAsset.isPending
                  ? "Subiendo..."
                  : "Selecciona un archivo para subir"}
              </Button>
            </div>

            <div className="grid gap-4 rounded-lg border p-4">
              <Text size="small" leading="compact" weight="plus">
                Elegir desde biblioteca
              </Text>
              <AssetPickerField
                label="Logo principal"
                value={mainLogo}
                profileId={profileId}
                preferredType="logo"
                onChange={setLogo}
              />
            </div>

            <div className="grid gap-4 rounded-lg border p-4">
              <Text size="small" leading="compact" weight="plus">
                URL manual
              </Text>
              <div className="grid gap-2">
                <Label>URL del logo</Label>
                <Input
                  value={mainLogo}
                  onChange={(event) => setLogo(event.target.value)}
                />
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                Para cambios avanzados de marca, colores o menu usa Brand
                profile.
              </Text>
            </div>
          </div>

          <div className="h-fit rounded-lg border bg-ui-bg-base">
            <div className="border-b p-4">
              <Text size="small" weight="plus">
                Vista previa
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Asi se vera el logo en superficies claras y oscuras.
              </Text>
            </div>
            <div className="grid gap-4 p-4">
              <LogoPreview title="Cabecera" logoUrl={mainLogo} tone="light" />
              <LogoPreview title="Footer" logoUrl={mainLogo} tone="dark" />
            </div>
          </div>
        </div>
      </Container>
      <Toaster />
    </>
  );
};

const LogoPreview = ({
  title,
  logoUrl,
  tone,
}: {
  title: string;
  logoUrl: string;
  tone: "light" | "dark";
}) => (
  <div
    className={[
      "grid gap-3 rounded-lg border p-4",
      tone === "dark" ? "bg-ui-bg-inverted" : "bg-ui-bg-subtle",
    ].join(" ")}
  >
    <Text
      size="small"
      weight="plus"
      className={tone === "dark" ? "text-ui-fg-on-inverted" : ""}
    >
      {title}
    </Text>
    <div className="flex h-20 items-center rounded border bg-ui-bg-base px-4">
      {logoUrl ? (
        <img
          src={resolveAdminAssetPreviewUrl(logoUrl)}
          alt="Logo preview"
          className="max-h-12 max-w-48 object-contain"
        />
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          Sin logo configurado
        </Text>
      )}
    </div>
  </div>
);

export const config = defineRouteConfig({
  label: "Logo del sitio",
  icon: Image,
});

export default SiteLogo;
