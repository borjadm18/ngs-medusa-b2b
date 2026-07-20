const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com";
const storefrontUrl =
  process.env.STOREFRONT_SMOKE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://storefront-virid-three-41.vercel.app";
const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
const adminPassword = process.env.ADMIN_PASSWORD || process.env.NGS_ADMIN_PASSWORD;
const requestTimeoutMs = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 45000);

if (!adminPassword) {
  console.error(
    "Missing ADMIN_PASSWORD. Example: ADMIN_PASSWORD=supersecret pnpm smoke:homepage"
  );
  process.exit(1);
}

async function withTimeout(label, action) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await action(controller.signal);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${label} timed out after ${requestTimeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function request(path, options = {}) {
  const response = await withTimeout(
    `${options.method || "GET"} ${path}`,
    (signal) =>
      fetch(`${backendUrl}${path}`, {
        ...options,
        signal,
        headers: {
          "content-type": "application/json",
          ...(options.headers || {}),
        },
      })
  );
  const text = await response.text();
  let body = text;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${path} failed with ${
        response.status
      }: ${typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body)}`
    );
  }

  return body;
}

async function storefrontRequest(pathname) {
  const response = await withTimeout(`GET ${pathname}`, (signal) =>
    fetch(`${storefrontUrl}${pathname}`, {
      signal,
      redirect: "manual",
    })
  );
  const body = await response.text();

  if (
    response.status >= 500 ||
    body.includes("Application error") ||
    body.includes("Digest:")
  ) {
    throw new Error(
      `${pathname} failed with ${response.status}: ${body.slice(0, 240)}`
    );
  }

  return {
    status: response.status,
    body,
  };
}

function assertHomepageShape(homepage, label) {
  const requiredStrings = [
    "heroTitle",
    "heroBody",
    "primaryCtaLabel",
    "primaryCtaHref",
    "heroImage",
    "heroImageAlt",
    "categoryTitle",
    "catalogTitle",
    "operationsTitle",
  ];

  for (const field of requiredStrings) {
    if (!homepage?.[field] || typeof homepage[field] !== "string") {
      throw new Error(`${label}: missing required string field ${field}`);
    }
  }

  const requiredArrays = [
    "metrics",
    "trustBlocks",
    "capabilityBlocks",
    "detailBlocks",
    "operations",
  ];

  for (const field of requiredArrays) {
    if (!Array.isArray(homepage?.[field]) || homepage[field].length < 1) {
      throw new Error(`${label}: ${field} must contain at least one item`);
    }
  }
}

async function main() {
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
  const apiKeys = await request("/admin/api-keys?limit=50", {
    headers: adminHeaders,
  });
  const publishableKey = (apiKeys.api_keys || []).find(
    (key) => key.type === "publishable"
  );

  if (!publishableKey?.token) {
    throw new Error("No publishable API key token found.");
  }

  const adminRead = await request("/admin/homepage", {
    headers: adminHeaders,
  });
  const original = adminRead.homepage;

  assertHomepageShape(original, "Admin homepage");

  const marker = `[smoke ${new Date().toISOString()}]`;
  const updated = {
    ...original,
    heroBody: `${original.heroBody.replace(/\s+\[smoke .*?\]$/, "")} ${marker}`,
    trustBlocks: original.trustBlocks.map((block, index) =>
      index === 0 ? { ...block, isHidden: true } : block
    ),
  };

  try {
    const adminWrite = await request("/admin/homepage", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(updated),
    });

    assertHomepageShape(adminWrite.homepage, "Admin homepage write");

    const storeRead = await request("/store/homepage", {
      headers: {
        "x-publishable-api-key": publishableKey.token,
      },
    });
    assertHomepageShape(storeRead.homepage, "Store homepage");

    if (!storeRead.homepage.heroBody.includes(marker)) {
      throw new Error("Store homepage did not reflect the admin update.");
    }

    if (storeRead.homepage.trustBlocks?.[0]?.isHidden !== true) {
      throw new Error("Store homepage did not preserve block visibility state.");
    }

    const publicHome = await storefrontRequest("/es");

    console.log(
      JSON.stringify(
        {
          ok: true,
          backendUrl,
          storefrontUrl,
          heroTitle: storeRead.homepage.heroTitle,
          metrics: storeRead.homepage.metrics.length,
          homepageStatus: publicHome.status,
        },
        null,
        2
      )
    );
  } finally {
    await request("/admin/homepage", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(original),
    });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
