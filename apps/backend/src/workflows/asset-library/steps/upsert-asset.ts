import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
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
