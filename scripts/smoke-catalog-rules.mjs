const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com";
const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
const adminPassword = process.env.ADMIN_PASSWORD || process.env.NGS_ADMIN_PASSWORD;

if (!adminPassword) {
  console.error(
    "Missing ADMIN_PASSWORD. Example: ADMIN_PASSWORD=supersecret pnpm smoke:catalog-rules"
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

  if (!auth.token) {
    throw new Error("Admin login succeeded but no token was returned.");
  }

  const adminHeaders = {
    authorization: `Bearer ${auth.token}`,
  };
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
    "/admin/products?limit=1&fields=id,title,variants.id,variants.title,variants.sku",
    {
      headers: adminHeaders,
    }
  );
  const product = productsResponse.products?.[0];

  if (!product?.id) {
    throw new Error("No product found to validate catalog rules.");
  }

  const variant = product.variants?.[0];

  if (!variant?.id) {
    throw new Error("No product variant found to validate price list sync.");
  }

  const payload = {
    name: "Smoke B2B canal distribuidor",
    description: "Regla generada por smoke test para validar catalogRules.",
    status: "active",
    priority: 10,
    rule_type: "price",
    target_type: "product",
    target_id: product.id,
    region_id: "reg_smoke_eu",
    sales_channel_id: "sc_smoke_distributor",
    currency_code: "eur",
    effect_type: "discount_percentage",
    discount_percentage: 7,
    minimum_quantity: 12,
    metadata: {
      source: "smoke-catalog-rules",
    },
  };
  const created = await request("/admin/catalog-rules", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(payload),
  });
  const catalogRule = created.catalog_rule;

  if (!catalogRule?.id) {
    throw new Error("Catalog rule was not created.");
  }

  const adminRead = await request(
    `/admin/catalog-rules?id=${encodeURIComponent(catalogRule.id)}`,
    {
      headers: adminHeaders,
    }
  );
  const storeRead = await request(
    `/store/catalog-rules?product_id=${encodeURIComponent(
      product.id
    )}&region_id=reg_smoke_eu&sales_channel_id=sc_smoke_distributor&currency_code=eur`,
    {
      headers: {
        "x-publishable-api-key": publishableKey.token,
      },
    }
  );
  const applies = (storeRead.applicable_rules || []).some(
    (rule) => rule.id === catalogRule.id
  );

  if (!adminRead.catalog_rules?.length || !applies) {
    throw new Error("Catalog rule was not visible through admin/store reads.");
  }

  const syncPayload = {
    name: `Smoke Price List Sync ${Date.now()}`,
    description: "Regla fixed price por variante para validar Price Lists.",
    status: "active",
    priority: 5,
    rule_type: "price",
    target_type: "variant",
    target_id: variant.id,
    currency_code: "eur",
    effect_type: "fixed_price",
    fixed_price: 42.5,
    minimum_quantity: 6,
    metadata: {
      source: "smoke-catalog-rules-price-list-sync",
    },
  };
  const syncRuleResponse = await request("/admin/catalog-rules", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(syncPayload),
  });
  const syncRule = syncRuleResponse.catalog_rule;

  if (!syncRule?.id) {
    throw new Error("Sync catalog rule was not created.");
  }

  const syncResponse = await request(
    `/admin/catalog-rules/${syncRule.id}/sync-price-list`,
    {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({}),
    }
  );

  if (!syncResponse.synced || !syncResponse.price_list?.id) {
    throw new Error("Catalog rule did not sync to a Medusa price list.");
  }

  const syncedMetadata =
    typeof syncResponse.catalog_rule?.metadata === "string"
      ? JSON.parse(syncResponse.catalog_rule.metadata)
      : syncResponse.catalog_rule?.metadata;

  if (syncedMetadata?.price_list_id !== syncResponse.price_list.id) {
    throw new Error("Synced catalog rule metadata does not contain price_list_id.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        backendUrl,
        product: product.title,
        catalog_rule: {
          id: catalogRule.id,
          name: catalogRule.name,
          effect_type: catalogRule.effect_type,
          discount_percentage: catalogRule.discount_percentage,
        },
        price_list_sync: {
          catalog_rule_id: syncRule.id,
          variant_id: variant.id,
          price_list_id: syncResponse.price_list.id,
        },
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
