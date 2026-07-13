import { createHash, randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { MedusaError } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { UpsertAssetInput } from "./upsert-asset";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const UPLOAD_DIR =
  process.env.ASSET_UPLOAD_DIR || path.join(process.cwd(), "uploads", "assets");

const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export type UploadAssetInput = Omit<UpsertAssetInput, "url"> & {
  filename: string;
  mime_type: string;
  content_base64: string;
  public_base_url: string;
};

const sanitizeFilenamePart = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

export const saveUploadedAssetFileStep = createStep(
  "save-uploaded-asset-file",
  async (input: UploadAssetInput) => {
    const extension = mimeExtensions[input.mime_type];

    if (!extension) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Formato no soportado. Usa JPG, PNG, WEBP, GIF o SVG."
      );
    }

    const buffer = Buffer.from(input.content_base64, "base64");

    if (!buffer.length || buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "La imagen debe pesar menos de 4 MB."
      );
    }

    const name =
      sanitizeFilenamePart(input.filename) ||
      sanitizeFilenamePart(input.label) ||
      "asset";
    const digest = createHash("sha1").update(buffer).digest("hex").slice(0, 10);
    const storedFilename = `${name}-${digest}-${randomUUID().slice(0, 8)}.${extension}`;
    const targetPath = path.join(UPLOAD_DIR, storedFilename);

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(targetPath, buffer);

    const baseUrl = input.public_base_url.replace(/\/$/, "");

    return new StepResponse<UpsertAssetInput, { targetPath: string }>(
      {
        id: input.id,
        label: input.label,
        alt: input.alt || null,
        type: input.type,
        client_profile_id: input.client_profile_id,
        tags: input.tags || null,
        sort_order: input.sort_order || 0,
        url: `${baseUrl}/store/asset-files/${storedFilename}`,
      },
      {
        targetPath,
      }
    );
  },
  async (rollbackData: { targetPath: string }) => {
    await rm(rollbackData.targetPath, { force: true }).catch(() => {});
  }
);
