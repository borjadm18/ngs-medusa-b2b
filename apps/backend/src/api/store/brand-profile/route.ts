import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { BRAND_PROFILE_MODULE } from "../../../modules/brand-profile";
import {
  BrandProfileContent,
  DEFAULT_BRAND_PROFILE_CONTENT,
} from "../../../modules/brand-profile/defaults";

const parseBrandProfileContent = (
  content?: string | null
): BrandProfileContent => {
  if (!content) {
    return DEFAULT_BRAND_PROFILE_CONTENT;
  }

  try {
    return {
      ...DEFAULT_BRAND_PROFILE_CONTENT,
      ...JSON.parse(content),
    };
  } catch {
    return DEFAULT_BRAND_PROFILE_CONTENT;
  }
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandProfileModule = req.scope.resolve<any>(BRAND_PROFILE_MODULE);
  const [config] = await brandProfileModule.listBrandProfileConfigs({
    key: "main",
  });

  res.json({
    brand_profile: parseBrandProfileContent(config?.content),
  });
};
