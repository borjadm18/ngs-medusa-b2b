const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com";
const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
const adminPassword = process.env.ADMIN_PASSWORD || process.env.NGS_ADMIN_PASSWORD;
const targetSku = process.env.PACKAGING_SKU || "NGS-WILD-BASH-COMPACT-BLK";

if (!adminPassword) {
  console.error(
    "Missing ADMIN_PASSWORD. Example: ADMIN_PASSWORD=supersecret pnpm smoke:admin-packaging"
  );
  process.exit(1);
}

const request = async (path, options = {}) => {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${path} failed with ${response.status}: ${text.slice(
        0,
        300
      )}`
    );
  }

  return body;
};

const main = async () => {
  const auth = await request("/auth/user/emailpass", {
    method: "POST",
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });
  const adminHeaders = {
    authorization: `Bearer ${auth.token}`,
  };

  if (!auth.token) {
    throw new Error("Admin login succeeded but no token was returned.");
  }

  const keys = await request("/admin/api-keys?limit=50", {
    headers: adminHeaders,
  });
  const publishableKey = (keys.api_keys || []).find(
    (key) => key.type === "publishable"
  );

  if (!publishableKey?.token) {
    throw new Error("No publishable API key token found.");
  }

  const productsResponse = await request(
    "/admin/products?limit=100&fields=id,title,variants.id,variants.sku,variants.title",
    {
      headers: adminHeaders,
    }
  );
  const products = productsResponse.products || [];
  const match = products
    .flatMap((product) =>
      (product.variants || []).map((variant) => ({
        product,
        variant,
      }))
    )
    .find(({ variant }) => variant.sku === targetSku);

  if (!match) {
    throw new Error(`Variant with SKU ${targetSku} was not found.`);
  }

  const packagingPayload = {
    variant_id: match.variant.id,
    sales_unit: "box",
    minimum_order_quantity: 6,
    quantity_increment: 6,
    units_per_box: 6,
    boxes_per_pallet: 48,
    package_weight: 19,
    package_dimensions: "600 x 355 x 350 mm",
  };

  await request("/admin/product-packaging", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(packagingPayload),
  });

  const adminRead = await request(
    `/admin/product-packaging?variant_id=${encodeURIComponent(match.variant.id)}`,
    {
      headers: adminHeaders,
    }
  );
  const storeRead = await request(
    `/store/product-packaging?variant_id=${encodeURIComponent(match.variant.id)}`,
    {
      headers: {
        "x-publishable-api-key": publishableKey.token,
      },
    }
  );
  const adminPackaging = adminRead.packaging?.[0];
  const storePackaging = storeRead.packaging?.[0];
  const expectedFields = [
    "sales_unit",
    "minimum_order_quantity",
    "quantity_increment",
    "units_per_box",
    "boxes_per_pallet",
    "package_weight",
    "package_dimensions",
  ];
  const mismatches = expectedFields.filter(
    (field) => adminPackaging?.[field] !== storePackaging?.[field]
  );

  if (!adminPackaging || !storePackaging || mismatches.length) {
    throw new Error(
      `Packaging mismatch between admin and store APIs: ${mismatches.join(", ")}`
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        backendUrl,
        product: match.product.title,
        variant: {
          id: match.variant.id,
          sku: match.variant.sku,
          title: match.variant.title,
        },
        packaging: storePackaging,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
