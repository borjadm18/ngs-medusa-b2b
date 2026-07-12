const DEFAULT_STOREFRONT_URL = "https://storefront-virid-three-41.vercel.app";

export const resolveAdminAssetPreviewUrl = (url?: string | null) => {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/images/")) {
    const storefrontUrl =
      import.meta.env.VITE_STOREFRONT_URL || DEFAULT_STOREFRONT_URL;

    return `${storefrontUrl.replace(/\/$/, "")}${url}`;
  }

  return url;
};
