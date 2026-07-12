const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com";
const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
const adminPassword =
  process.env.ADMIN_PASSWORD || process.env.NGS_ADMIN_PASSWORD;

if (!adminPassword) {
  console.error(
    "Missing ADMIN_PASSWORD. Example: ADMIN_PASSWORD=supersecret pnpm smoke:assets"
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
      `${options.method || "GET"} ${path} failed with ${
        response.status
      }: ${text.slice(0, 300)}`
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
  const listBefore = await request("/admin/assets?client_profile_id=ngs", {
    headers: adminHeaders,
  });

  const created = await request("/admin/assets", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      label: "Smoke asset",
      url: "/images/ngs/home-hero-ngs-speakers.png",
      alt: "Smoke test asset",
      type: "homepage",
      client_profile_id: "ngs",
      tags: "smoke",
      sort_order: 999,
    }),
  });

  if (!created.asset?.id) {
    throw new Error("Asset create response did not include an id.");
  }

  const listAfterCreate = await request("/admin/assets?client_profile_id=ngs", {
    headers: adminHeaders,
  });
  const createdExists = (listAfterCreate.assets || []).some(
    (asset) => asset.id === created.asset.id
  );

  if (!createdExists) {
    throw new Error("Created asset was not returned by the list endpoint.");
  }

  await request(`/admin/assets/${created.asset.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        backendUrl,
        defaultAssets: listBefore.assets?.length || 0,
        createdAsset: created.asset.id,
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
