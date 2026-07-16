import fs from "node:fs"
import path from "node:path"

const demoUsers = [
  "compras+buyer@iberia-pro-installers.demo",
  "pedidos+buyer@dnaudio.demo",
  "it-procurement+buyer@retail-campus.demo",
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
const acceptQuoteId = env.SMOKE_ACCEPT_QUOTE_ID
const acceptConfirm = env.SMOKE_ACCEPT_QUOTE_CONFIRM
const requestTimeoutMs = Number(env.SMOKE_REQUEST_TIMEOUT_MS || 30000)

async function withTimeout(label, action) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    return await action(controller.signal)
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${label} timed out after ${requestTimeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

async function backendRequest(pathname, options = {}) {
  const response = await withTimeout(
    `${options.method || "GET"} ${pathname}`,
    (signal) =>
      fetch(`${backendUrl}${pathname}`, {
        ...options,
        signal,
        headers: {
          ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
          "content-type": "application/json",
          ...(options.headers || {}),
        },
      })
  )

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
  const response = await withTimeout(`GET ${url.toString()}`, (signal) =>
    fetch(url, {
      redirect: "manual",
      signal,
      headers: {
        cookie: [
          `_medusa_jwt=${token}`,
          `_medusa_cache_id=quote-smoke-${encodeURIComponent(email)}`,
        ].join("; "),
      },
    })
  )

  const body = await response.text()

  if (
    response.status >= 500 ||
    body.includes("Application error") ||
    body.includes("Digest:")
  ) {
    throw new Error(
      `${email} ${pathname} failed with ${response.status}: ${body.slice(
        0,
        240
      )}`
    )
  }

  return response.status
}

const candidates = []

for (const email of demoUsers) {
  console.log(`Checking quotes for ${email}`)

  const auth = await backendRequest("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (!auth?.token) {
    throw new Error(`Login did not return a token for ${email}`)
  }

  const headers = {
    authorization: `Bearer ${auth.token}`,
  }
  const { quotes = [] } = await backendRequest("/store/quotes?order=-created_at", {
    headers,
  })

  for (const quote of quotes.filter((item) => item.status === "pending_customer")) {
    console.log(`  validating ${quote.id}`)
    await backendRequest(`/store/quotes/${quote.id}/preview`, { headers })
    const detailStatus = await storefrontRequest(
      `/es/account/quotes/details/${quote.id}`,
      auth.token,
      email
    )

    candidates.push({
      id: quote.id,
      email,
      token: auth.token,
      detailStatus,
      displayId: quote.draft_order?.display_id || "-",
    })
  }
}

console.log("Quote acceptance readiness")
console.log(`Storefront: ${storefrontUrl}`)
console.log(`Backend: ${backendUrl}`)

for (const candidate of candidates) {
  console.log(
    `${candidate.id} customer=${candidate.email} order=${candidate.displayId} detail=${candidate.detailStatus}`
  )
}

if (!candidates.length) {
  throw new Error(
    "No hay presupuestos pending_customer para demostrar accept quote. Reejecuta seed:b2b-demo o prepara uno desde Admin."
  )
}

if (!acceptQuoteId) {
  console.log(
    "\nDry run OK. Para aceptar uno de verdad: SMOKE_ACCEPT_QUOTE_ID=<quote_id> SMOKE_ACCEPT_QUOTE_CONFIRM=ACCEPT pnpm smoke:quote-acceptance"
  )
  process.exit(0)
}

if (acceptConfirm !== "ACCEPT") {
  throw new Error(
    "SMOKE_ACCEPT_QUOTE_ID esta definido, pero falta SMOKE_ACCEPT_QUOTE_CONFIRM=ACCEPT."
  )
}

const candidate = candidates.find((item) => item.id === acceptQuoteId)

if (!candidate) {
  throw new Error(
    `El presupuesto ${acceptQuoteId} no esta disponible como pending_customer para los usuarios demo.`
  )
}

const accepted = await backendRequest(`/store/quotes/${candidate.id}/accept`, {
  method: "POST",
  body: JSON.stringify({}),
  headers: {
    authorization: `Bearer ${candidate.token}`,
  },
})

if (accepted.quote?.status !== "accepted") {
  throw new Error(
    `Accept quote no devolvio status accepted: ${JSON.stringify(accepted.quote)}`
  )
}

const postAcceptStatus = await storefrontRequest(
  `/es/account/quotes/details/${candidate.id}`,
  candidate.token,
  candidate.email
)

console.log(
  `Accepted ${candidate.id}. Post-accept detail page responded ${postAcceptStatus}.`
)
