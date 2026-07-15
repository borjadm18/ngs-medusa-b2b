import fs from "node:fs"
import path from "node:path"

const demoUsers = [
  "compras+buyer@iberia-pro-installers.demo",
  "pedidos+buyer@dnaudio.demo",
  "it-procurement+buyer@retail-campus.demo",
]

const accountRoutes = [
  "/es/account",
  "/es/account/company",
  "/es/account/orders",
  "/es/account/quotes",
  "/es/account/quick-order",
  "/es/account/approvals",
  "/es/account/addresses",
  "/es/account/profile",
]

function loadEnv(file) {
  if (!fs.existsSync(file)) {
    return {}
  }

  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=")
        const key = line.slice(0, index).trim()
        let value = line.slice(index + 1).trim()

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }

        return [key, value]
      })
  )
}

const env = {
  ...loadEnv(path.join(process.cwd(), "apps/storefront/.env.local")),
  ...process.env,
}

const backendUrl =
  env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com"
const storefrontUrl =
  env.STOREFRONT_SMOKE_URL ||
  env.NEXT_PUBLIC_BASE_URL ||
  "https://storefront-virid-three-41.vercel.app"
const publishableKey = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const password = env.DEMO_CUSTOMER_PASSWORD || "Demo123!"

async function backendRequest(pathname, options = {}) {
  const response = await fetch(`${backendUrl}${pathname}`, {
    ...options,
    headers: {
      ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${pathname} failed with ${
        response.status
      }: ${JSON.stringify(body)}`
    )
  }

  return body
}

async function storefrontRequest(pathname, token, email) {
  const url = new URL(pathname, storefrontUrl)
  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      cookie: [
        `_medusa_jwt=${token}`,
        `_medusa_cache_id=smoke-${encodeURIComponent(email)}`,
      ].join("; "),
    },
  })

  const body = await response.text()
  const hasServerError =
    response.status >= 500 ||
    body.includes("Application error") ||
    body.includes("Digest:")

  if (hasServerError) {
    throw new Error(
      `${email} ${pathname} failed with ${response.status}: ${body.slice(
        0,
        240
      )}`
    )
  }

  return {
    status: response.status,
    redirected: response.status >= 300 && response.status < 400,
  }
}

const summary = []

for (const email of demoUsers) {
  const auth = await backendRequest("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (!auth?.token) {
    throw new Error(`Login did not return a token for ${email}`)
  }

  const quoteData = await backendRequest("/store/quotes?order=-created_at", {
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  }).catch(() => ({ quotes: [] }))

  const routes = [...accountRoutes]
  const firstQuote = quoteData.quotes?.[0]

  if (firstQuote?.id) {
    routes.push(`/es/account/quotes/details/${firstQuote.id}`)
  }

  for (const route of routes) {
    const result = await storefrontRequest(route, auth.token, email)
    summary.push({ email, route, ...result })
  }
}

console.log("Storefront account smoke OK")
console.log(`Storefront: ${storefrontUrl}`)
console.log(`Backend: ${backendUrl}`)

for (const row of summary) {
  console.log(
    `${row.email} ${row.route}: ${row.status}${
      row.redirected ? " redirect" : ""
    }`
  )
}
