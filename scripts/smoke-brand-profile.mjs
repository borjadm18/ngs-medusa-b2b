const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com";
const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
const adminPassword = process.env.ADMIN_PASSWORD || process.env.NGS_ADMIN_PASSWORD;

if (!adminPassword) {
  console.error(
    "Missing ADMIN_PASSWORD. Example: ADMIN_PASSWORD=supersecret pnpm smoke:brand-profile"
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

  const adminRead = await request("/admin/brand-profile", {
    headers: adminHeaders,
  });
  const profile = adminRead.brand_profile;

  await request("/admin/brand-profile", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(profile),
  });

  const storeRead = await request("/store/brand-profile", {
    headers: {
      "x-publishable-api-key": publishableKey.token,
    },
  });
  const storeProfile = storeRead.brand_profile;

  const checks = {
    brandName: storeProfile?.brand?.name === profile?.brand?.name,
    navCount:
      storeProfile?.navigation?.main?.length === profile?.navigation?.main?.length,
    footerCount:
      storeProfile?.footer?.columns?.length === profile?.footer?.columns?.length,
  };

  if (!checks.brandName || !checks.navCount || !checks.footerCount) {
    throw new Error(`Brand profile smoke failed: ${JSON.stringify(checks)}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        backendUrl,
        brand: storeProfile.brand.name,
        navigationItems: storeProfile.navigation.main.length,
        footerColumns: storeProfile.footer.columns.length,
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
