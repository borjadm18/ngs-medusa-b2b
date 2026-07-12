import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { HOMEPAGE_MODULE } from "./src/modules/homepage";
import { PRODUCT_PACKAGING_MODULE } from "./src/modules/product-packaging";
import { BRAND_PROFILE_MODULE } from "./src/modules/brand-profile";
import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: {
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    [APPROVAL_MODULE]: {
      resolve: "./modules/approval",
    },
    [HOMEPAGE_MODULE]: {
      resolve: "./modules/homepage",
    },
    [PRODUCT_PACKAGING_MODULE]: {
      resolve: "./modules/product-packaging",
    },
    [BRAND_PROFILE_MODULE]: {
      resolve: "./modules/brand-profile",
    },
  },
});
