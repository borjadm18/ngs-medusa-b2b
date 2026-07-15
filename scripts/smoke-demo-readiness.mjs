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
const publishableKey = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const password = env.DEMO_CUSTOMER_PASSWORD || "Demo123!"

async function request(pathname, options = {}) {
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

const totals = {
  users: 0,
  quotes: 0,
  pendingCustomer: 0,
  pendingMerchant: 0,
  accepted: 0,
}

for (const email of demoUsers) {
  const auth = await request("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (!auth?.token) {
    throw new Error(`Login did not return a token for ${email}`)
  }

  const { quotes = [] } = await request("/store/quotes?order=-created_at", {
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  })

  totals.users += 1
  totals.quotes += quotes.length
  totals.pendingCustomer += quotes.filter(
    (quote) => quote.status === "pending_customer"
  ).length
  totals.pendingMerchant += quotes.filter(
    (quote) => quote.status === "pending_merchant"
  ).length
  totals.accepted += quotes.filter((quote) => quote.status === "accepted")
    .length

  console.log(
    `${email}: ${quotes
      .map((quote) => `${quote.id}:${quote.status}`)
      .join(", ") || "sin presupuestos"}`
  )
}

console.log("\nDemo readiness summary")
console.log(`Backend: ${backendUrl}`)
console.log(`Usuarios validados: ${totals.users}/${demoUsers.length}`)
console.log(`Presupuestos: ${totals.quotes}`)
console.log(`Pendientes cliente: ${totals.pendingCustomer}`)
console.log(`Pendientes ventas: ${totals.pendingMerchant}`)
console.log(`Aceptados: ${totals.accepted}`)

if (totals.pendingCustomer === 0) {
  console.warn(
    "\nAviso: no queda ningun presupuesto pendiente de cliente para demostrar accept quote. Reinicia/reseed backend para regenerar escenarios abiertos."
  )
}
