import { model } from "@medusajs/framework/utils";

export const Asset = model.define("asset", {
  id: model
    .id({
      prefix: "asset",
    })
    .primaryKey(),
  label: model.text(),
  url: model.text(),
  alt: model.text().nullable(),
  type: model
    .enum([
      "logo",
      "hero",
      "homepage",
      "product",
      "category",
      "document",
      "other",
    ])
    .default("homepage"),
  client_profile_id: model.text().default("ngs"),
  tags: model.text().nullable(),
  sort_order: model.number().default(0),
});
