import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { ASSET_LIBRARY_MODULE } from "../../../modules/asset-library";

export type UpsertAssetInput = {
  id?: string;
  label: string;
  url: string;
  alt?: string | null;
  type:
    | "logo"
    | "hero"
    | "homepage"
    | "product"
    | "category"
    | "document"
    | "other";
  client_profile_id: string;
  tags?: string | null;
  sort_order?: number;
};

type AssetRecord = UpsertAssetInput & {
  id: string;
};

const normalize = (value: string | null | undefined) =>
  (value || "").trim().toLowerCase();

const getShaTag = (tags: string | null | undefined) =>
  (tags || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .find((tag) => tag.startsWith("sha1:"));

export const upsertAssetStep = createStep(
  "upsert-asset",
  async (input: UpsertAssetInput, { container }) => {
    const assetLibraryModule = container.resolve<any>(ASSET_LIBRARY_MODULE);
    const data = {
      ...input,
      alt: input.alt || null,
      tags: input.tags || null,
      sort_order: input.sort_order || 0,
    };

    const existing = input.id
      ? await assetLibraryModule
          .retrieveAsset(input.id)
          .catch(() => null as AssetRecord | null)
      : null;

    if (!existing) {
      const currentAssets = await assetLibraryModule.listAssets({
        client_profile_id: data.client_profile_id,
        type: data.type,
      });
      const inputName = normalize(data.label);
      const inputSha = getShaTag(data.tags);
      const duplicate = currentAssets.find((asset: AssetRecord) => {
        const sameName = normalize(asset.label) === inputName;
        const sameHash = inputSha && getShaTag(asset.tags) === inputSha;

        return sameName || sameHash;
      });

      if (duplicate) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          `Ya existe un asset similar para este perfil: ${duplicate.label}`
        );
      }
    }

    const asset = existing
      ? await assetLibraryModule.updateAssets({
          id: existing.id,
          ...data,
        })
      : await assetLibraryModule.createAssets(data);

    return new StepResponse(asset, {
      createdId: existing ? null : asset.id,
      previousData: existing,
    });
  },
  async (
    rollbackData: {
      createdId: string | null;
      previousData: AssetRecord | null;
    },
    { container }
  ) => {
    const assetLibraryModule = container.resolve<any>(ASSET_LIBRARY_MODULE);

    if (rollbackData.previousData) {
      await assetLibraryModule.updateAssets(rollbackData.previousData);
      return;
    }

    if (rollbackData.createdId) {
      await assetLibraryModule.deleteAssets([rollbackData.createdId]);
    }
  }
);
