import { Button, Input, Label, Text } from "@medusajs/ui";
import { useMemo, useState } from "react";
import { AdminAsset, AssetType, useAssets } from "../../hooks/api/assets";
import { resolveAdminAssetPreviewUrl } from "../../lib/assets";

type AssetPickerFieldProps = {
  label: string;
  value: string;
  profileId?: string;
  preferredType?: AssetType | "all";
  onChange: (value: string) => void;
};

const getAssetKey = (asset: AdminAsset) =>
  asset.id || `${asset.type}-${asset.url}`;

export const AssetPickerField = ({
  label,
  value,
  profileId = "ngs",
  preferredType = "all",
  onChange,
}: AssetPickerFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending } = useAssets({
    client_profile_id: profileId,
    type: preferredType,
  });

  const assets = useMemo(() => data?.assets || [], [data?.assets]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? "Cerrar assets" : "Seleccionar asset"}
        </Button>
      </div>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />

      {isOpen ? (
        <div className="grid gap-3 rounded-lg border bg-ui-bg-subtle p-3">
          {isPending ? (
            <Text size="small" className="text-ui-fg-subtle">
              Cargando assets...
            </Text>
          ) : null}

          {!isPending && !assets.length ? (
            <Text size="small" className="text-ui-fg-subtle">
              No hay assets para este perfil y tipo.
            </Text>
          ) : null}

          {assets.length ? (
            <div className="grid gap-2 small:grid-cols-2">
              {assets.map((asset) => (
                <div
                  key={getAssetKey(asset)}
                  className="grid gap-2 rounded-lg border bg-ui-bg-base p-2"
                >
                  <div className="aspect-video overflow-hidden rounded-lg border bg-ui-bg-subtle">
                    <img
                      src={resolveAdminAssetPreviewUrl(asset.url)}
                      alt={asset.alt || ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Text size="small" leading="compact" weight="plus">
                      {asset.label}
                    </Text>
                    <Text
                      size="xsmall"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {asset.type} - {asset.url}
                    </Text>
                  </div>
                  <Button
                    type="button"
                    size="small"
                    variant={value === asset.url ? "primary" : "secondary"}
                    onClick={() => {
                      onChange(asset.url);
                      setIsOpen(false);
                    }}
                  >
                    {value === asset.url ? "Seleccionado" : "Usar"}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
