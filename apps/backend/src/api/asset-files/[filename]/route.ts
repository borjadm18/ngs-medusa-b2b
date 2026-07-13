import { readFile } from "fs/promises";
import path from "path";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";

const UPLOAD_DIR =
  process.env.ASSET_UPLOAD_DIR || path.join(process.cwd(), "uploads", "assets");

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const filename = String(req.params.filename || "");

  if (!/^[a-z0-9][a-z0-9.-]*\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid filename");
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  const buffer = await readFile(filePath).catch(() => null);

  if (!buffer) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Asset file not found");
  }

  const extension = path.extname(filename).toLowerCase();

  res.setHeader(
    "Content-Type",
    contentTypes[extension] || "application/octet-stream"
  );
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(buffer);
};
