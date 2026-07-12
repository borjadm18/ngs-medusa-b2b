import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo, Plus, Trash } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  Toaster,
  toast,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import {
  AdminAsset,
  AssetType,
  useAssets,
  useDeleteAsset,
  useUpsertAsset,
} from "../../hooks/api/assets";

const assetTypes: Array<AssetType | "all"> = [
  "all",
  "logo",
  "hero",
  "homepage",
  "product",
  "category",
  "document",
  "other",
];

const emptyAsset: AdminAsset = {
  label: "",
  url: "",
  alt: "",
  type: "homepage",
  client_profile_id: "ngs",
  tags: "",
  sort_order: 0,
};

const AssetsPage = () => {
  const [profileId, setProfileId] = useState("ngs");
  const [type, setType] = useState<AssetType | "all">("all");
  const [form, setForm] = useState<AdminAsset>(emptyAsset);

  const { data, isPending } = useAssets({
    client_profile_id: profileId,
    type,
  });

  const assets = data?.assets || [];
  const sortedAssets = useMemo(
    () =>
      [...assets].sort(
        (left, right) => (left.sort_order || 0) - (right.sort_order || 0)
      ),
    [assets]
  );

  const upsertAsset = useUpsertAsset({
    onSuccess: () => {
      toast.success("Asset guardado");
      setForm({
        ...emptyAsset,
        client_profile_id: profileId,
      });
    },
    onError: (error) => toast.error(error.message || "No se pudo guardar"),
  });

  const deleteAsset = useDeleteAsset({
    onSuccess: () => toast.success("Asset eliminado"),
    onError: (error) => toast.error(error.message || "No se pudo eliminar"),
  });

  const updateField = (
    field: keyof AdminAsset,
    value: string | number | AssetType
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEdit = (asset: AdminAsset) => {
    setForm({
      ...emptyAsset,
      ...asset,
      alt: asset.alt || "",
      tags: asset.tags || "",
      sort_order: asset.sort_order || 0,
    });
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Ruta copiada");
  };

  const handleSubmit = () => {
    if (!form.label || !form.url) {
      toast.error("Nombre y URL son obligatorios");
      return;
    }

    upsertAsset.mutate({
      ...form,
      client_profile_id: form.client_profile_id || profileId,
      alt: form.alt || null,
      tags: form.tags || null,
      sort_order: Number(form.sort_order || 0),
    });
  };

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <Heading className="font-sans font-medium h1-core">Assets</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Libreria de imagenes reutilizables para home, marca, categorias y
              producto.
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              setForm({
                ...emptyAsset,
                client_profile_id: profileId,
              })
            }
          >
            <Plus />
            Nuevo asset
          </Button>
        </div>

        <div className="grid gap-6 p-6 small:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4 small:grid-cols-[1fr_220px]">
              <TextField
                label="Perfil cliente"
                value={profileId}
                onChange={setProfileId}
              />
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as AssetType | "all")}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {assetTypes.map((assetType) => (
                      <Select.Item key={assetType} value={assetType}>
                        {assetType === "all" ? "Todos" : assetType}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>

            {isPending ? (
              <Text size="small" className="text-ui-fg-subtle">
                Cargando assets...
              </Text>
            ) : (
              <div className="grid gap-3 medium:grid-cols-2">
                {sortedAssets.map((asset) => {
                  const isDefault = asset.id?.startsWith("default-");

                  return (
                    <article
                      key={`${asset.id || asset.url}-${asset.label}`}
                      className="overflow-hidden rounded-lg border bg-ui-bg-base"
                    >
                      <div className="aspect-video bg-ui-bg-subtle">
                        {asset.url ? (
                          <img
                            src={asset.url}
                            alt={asset.alt || asset.label}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="grid gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Text size="small" weight="plus">
                              {asset.label}
                            </Text>
                            <Text size="small" className="text-ui-fg-subtle">
                              {asset.type} · {asset.client_profile_id}
                            </Text>
                          </div>
                          <IconButton
                            size="small"
                            variant="transparent"
                            disabled={isDefault || !asset.id}
                            onClick={() =>
                              asset.id && deleteAsset.mutate(asset.id)
                            }
                          >
                            <Trash />
                          </IconButton>
                        </div>
                        <Text
                          size="small"
                          className="break-all font-mono text-ui-fg-subtle"
                        >
                          {asset.url}
                        </Text>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleEdit(asset)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleCopy(asset.url)}
                          >
                            Copiar ruta
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-fit rounded-lg border bg-ui-bg-base p-4">
            <Text size="small" weight="plus">
              {form.id ? "Editar asset" : "Nuevo asset"}
            </Text>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              Usa rutas internas como /images/ngs/home-hero.png o URLs
              absolutas.
            </Text>

            <div className="mt-4 grid gap-3">
              <TextField
                label="Nombre"
                value={form.label}
                onChange={(value) => updateField("label", value)}
              />
              <TextField
                label="URL / ruta"
                value={form.url}
                onChange={(value) => updateField("url", value)}
              />
              <TextAreaField
                label="Alt text"
                value={form.alt || ""}
                rows={2}
                onChange={(value) => updateField("alt", value)}
              />
              <div className="grid gap-3 small:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      updateField("type", value as AssetType)
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {assetTypes
                        .filter((assetType) => assetType !== "all")
                        .map((assetType) => (
                          <Select.Item key={assetType} value={assetType}>
                            {assetType}
                          </Select.Item>
                        ))}
                    </Select.Content>
                  </Select>
                </div>
                <TextField
                  label="Perfil"
                  value={form.client_profile_id}
                  onChange={(value) => updateField("client_profile_id", value)}
                />
              </div>
              <div className="grid gap-3 small:grid-cols-[1fr_120px]">
                <TextField
                  label="Tags"
                  value={form.tags || ""}
                  onChange={(value) => updateField("tags", value)}
                />
                <NumberField
                  label="Orden"
                  value={Number(form.sort_order || 0)}
                  onChange={(value) => updateField("sort_order", value)}
                />
              </div>
              {form.url ? (
                <div className="aspect-video overflow-hidden rounded-lg border bg-ui-bg-subtle">
                  <img
                    src={form.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <Button
                size="small"
                onClick={handleSubmit}
                isLoading={upsertAsset.isPending}
              >
                Guardar asset
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <Toaster />
    </>
  );
};

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

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <Input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
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
  label: "Assets",
  icon: Photo,
});

export default AssetsPage;
