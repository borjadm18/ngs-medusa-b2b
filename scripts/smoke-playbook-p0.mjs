import fs from "node:fs"
import path from "node:path"

const demoUsers = [
  {
    email: "compras+buyer@iberia-pro-installers.demo",
    company: "Iberia Pro Installers",
    expectedStatus: "approved",
  },
  {
    email: "pedidos+buyer@dnaudio.demo",
    company: "Distribuciones Norte Audio",
    expectedStatus: "approved",
  },
  {
    email: "it-procurement+buyer@retail-campus.demo",
    company: "Retail Campus Group",
    expectedStatus: "approved",
  },
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

const quickOrderSkus = [
  "NGS-WILD-BASH-COMPACT-BLK",
  "NGS-EVO-MOUSE-BLK",
  "NGS-XPRESSCAM-1080-BLK",
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
const adminEmail = env.ADMIN_EMAIL || "admin@test.com"
const adminPassword = env.ADMIN_PASSWORD || env.NGS_ADMIN_PASSWORD
const requestTimeoutMs = Number(env.SMOKE_REQUEST_TIMEOUT_MS || 45000)

const checks = []

function pass(name, detail = "") {
  checks.push({ status: "OK", name, detail })
}

function warn(name, detail = "") {
  checks.push({ status: "WARN", name, detail })
}

function fail(name, detail = "") {
  checks.push({ status: "FAIL", name, detail })
}

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
  let body = text

  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${pathname} failed with ${
        response.status
      }: ${typeof body === "string" ? body.slice(0, 260) : JSON.stringify(body)}`
    )
  }

  return body
}

async function storefrontRequest(pathname, token, email) {
  const url = new URL(pathname, storefrontUrl)
  const headers = token
    ? {
        cookie: [
          `_medusa_jwt=${token}`,
          `_medusa_cache_id=playbook-p0-${encodeURIComponent(email || "public")}`,
        ].join("; "),
      }
    : {}

  const response = await withTimeout(`GET ${url.toString()}`, (signal) =>
    fetch(url, {
      redirect: "manual",
      signal,
      headers,
    })
  )

  const body = await response.text()
  const hasServerError =
    response.status >= 500 ||
    body.includes("Application error") ||
    body.includes("Digest:")

  if (hasServerError) {
    throw new Error(
      `${pathname} failed with ${response.status}: ${body.slice(0, 240)}`
    )
  }

  return {
    status: response.status,
    body,
  }
}

function assertNoPublicPriceLeak(label, body) {
  const normalized = body.replace(/\s+/g, " ")
  const visibleEuroPrice =
    /€\s?\d+[,.]?\d*/.test(normalized) ||
    /\d+[,.]\d{2}\s?€/.test(normalized)

  if (visibleEuroPrice) {
    fail(label, "La pagina publica contiene un precio con simbolo euro.")
    return
  }

  pass(label, "No se detectan importes visibles en HTML anonimo.")
}

async function main() {
  await backendRequest("/health").then(() =>
    pass("Backend Render health", backendUrl)
  )

  const publicHome = await storefrontRequest("/es")
  pass("Storefront home publica", `HTTP ${publicHome.status}`)

  const publicStore = await storefrontRequest("/es/store")
  pass("Storefront catalogo publico", `HTTP ${publicStore.status}`)
  assertNoPublicPriceLeak("Catalogo publico sin precios", publicStore.body)

  const productsResponse = await backendRequest(
    "/store/products?limit=8&fields=id,title,handle,variants.id,variants.sku"
  )
  const products = productsResponse.products || []
  const firstProduct = products.find((product) => product.handle)

  if (!firstProduct) {
    throw new Error("No hay productos con handle para validar PDP publica.")
  }

  const publicPdp = await storefrontRequest(`/es/products/${firstProduct.handle}`)
  pass("PDP publica accesible", `${firstProduct.title} HTTP ${publicPdp.status}`)
  assertNoPublicPriceLeak("PDP publica sin precios", publicPdp.body)

  const totals = {
    users: 0,
    pendingCustomer: 0,
    pendingMerchant: 0,
    accepted: 0,
    historicalOrders: 0,
    quickOrderItems: 0,
  }

  for (const user of demoUsers) {
    const auth = await backendRequest("/auth/customer/emailpass", {
      method: "POST",
      body: JSON.stringify({ email: user.email, password }),
    })

    if (!auth?.token) {
      throw new Error(`Login did not return a token for ${user.email}`)
    }

    const headers = {
      authorization: `Bearer ${auth.token}`,
    }

    const { customer } = await backendRequest(
      "/store/customers/me?fields=*employee,*employee.company,*orders",
      { headers }
    )
    const company = customer?.employee?.company

    if (!company) {
      fail(`${user.email} tiene empresa B2B`, "No se encontro employee.company.")
      continue
    }

    totals.users += 1

    if (company.onboarding_status !== user.expectedStatus) {
      fail(
        `${user.company} onboarding`,
        `Esperado ${user.expectedStatus}, recibido ${company.onboarding_status}`
      )
    } else {
      pass(`${user.company} onboarding`, company.onboarding_status)
    }

    if (!company.tax_id || !company.payment_terms) {
      fail(
        `${user.company} datos comerciales`,
        "Falta tax_id o payment_terms."
      )
    } else {
      pass(
        `${user.company} datos comerciales`,
        `${company.tax_id} / ${company.payment_terms}`
      )
    }

    if (!company.saved_payment_methods?.length) {
      warn(
        `${user.company} metodos de pago`,
        "No hay saved_payment_methods demo."
      )
    } else {
      pass(
        `${user.company} metodos de pago demo`,
        `${company.saved_payment_methods.length} metodo(s)`
      )
    }

    const orders = customer.orders || []
    totals.historicalOrders += orders.filter((order) => !order.is_draft_order).length

    for (const route of accountRoutes) {
      const result = await storefrontRequest(route, auth.token, user.email)
      pass(`${user.email} ${route}`, `HTTP ${result.status}`)
    }

    const { quotes = [] } = await backendRequest("/store/quotes?order=-created_at", {
      headers,
    })

    totals.pendingCustomer += quotes.filter(
      (quote) => quote.status === "pending_customer"
    ).length
    totals.pendingMerchant += quotes.filter(
      (quote) => quote.status === "pending_merchant"
    ).length
    totals.accepted += quotes.filter((quote) => quote.status === "accepted").length

    const pendingCustomerQuote = quotes.find(
      (quote) => quote.status === "pending_customer"
    )
    const quoteToOpen = pendingCustomerQuote || quotes[0]

    if (quoteToOpen?.id) {
      await backendRequest(`/store/quotes/${quoteToOpen.id}/preview`, { headers })
      pass(`${user.email} preview presupuesto`, quoteToOpen.id)

      const detail = await storefrontRequest(
        `/es/account/quotes/details/${quoteToOpen.id}`,
        auth.token,
        user.email
      )
      pass(`${user.email} detalle presupuesto`, `HTTP ${detail.status}`)
    } else {
      warn(`${user.email} presupuestos`, "No tiene presupuestos demo.")
    }

    const quickOrder = await backendRequest("/store/quick-order/resolve", {
      method: "POST",
      body: JSON.stringify({ skus: quickOrderSkus }),
      headers,
    })

    if (quickOrder.missing_skus?.length) {
      fail(
        `${user.email} pedido rapido`,
        `SKUs faltantes: ${quickOrder.missing_skus.join(", ")}`
      )
    } else {
      totals.quickOrderItems += quickOrder.items?.length || 0
      pass(
        `${user.email} pedido rapido`,
        `${quickOrder.items?.length || 0} referencias resueltas`
      )
    }
  }

  if (totals.users !== demoUsers.length) {
    fail("Usuarios demo", `${totals.users}/${demoUsers.length} validados`)
  } else {
    pass("Usuarios demo", `${totals.users}/${demoUsers.length} validados`)
  }

  if (totals.pendingCustomer < 1) {
    fail(
      "Presupuesto aceptable",
      "Debe existir al menos un presupuesto pending_customer."
    )
  } else {
    pass("Presupuesto aceptable", `${totals.pendingCustomer} pending_customer`)
  }

  if (totals.pendingMerchant < 1) {
    warn(
      "Presupuesto pendiente ventas",
      "No hay pending_merchant para demostrar revision comercial."
    )
  } else {
    pass("Presupuesto pendiente ventas", `${totals.pendingMerchant} pending_merchant`)
  }

  if (totals.accepted < 1) {
    warn(
      "Presupuesto aceptado historico",
      "No hay accepted para demostrar historico de presupuestos."
    )
  } else {
    pass("Presupuesto aceptado historico", `${totals.accepted} accepted`)
  }

  if (totals.historicalOrders < 1) {
    fail(
      "Pedidos historicos/reorder",
      "Debe existir al menos un pedido historico no draft."
    )
  } else {
    pass("Pedidos historicos/reorder", `${totals.historicalOrders} pedido(s)`)
  }

  if (totals.quickOrderItems < demoUsers.length * quickOrderSkus.length) {
    fail(
      "Pedido rapido por SKU",
      `${totals.quickOrderItems} resoluciones para ${demoUsers.length} usuarios`
    )
  }

  if (adminPassword) {
    const adminAuth = await backendRequest("/auth/user/emailpass", {
      method: "POST",
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    })

    if (!adminAuth?.token) {
      fail("Admin login", "No se recibio token de usuario admin.")
    } else {
      const adminHeaders = {
        authorization: `Bearer ${adminAuth.token}`,
      }

      pass("Admin login", adminEmail)

      const summary = await backendRequest("/admin/b2b-control/summary", {
        headers: adminHeaders,
      })
      pass(
        "Admin B2B Control",
        `${summary?.summary?.companies?.total || 0} empresas / ${
          summary?.summary?.quotes?.total || 0
        } presupuestos`
      )

      const companies = await backendRequest(
        "/admin/companies?fields=id,name,onboarding_status,*employees",
        { headers: adminHeaders }
      )
      const companyCount = companies.companies?.length || 0
      if (!companyCount) {
        fail("Admin empresas", "No devuelve empresas para aprobar/denegar.")
      } else {
        pass("Admin empresas", `${companyCount} visibles`)
      }

      const quotes = await backendRequest("/admin/quotes?limit=20", {
        headers: adminHeaders,
      })
      if (!quotes.quotes?.length) {
        fail("Admin presupuestos", "No devuelve presupuestos.")
      } else {
        pass("Admin presupuestos", `${quotes.quotes.length} visibles`)
      }

      const catalogRules = await backendRequest("/admin/catalog-rules?limit=20", {
        headers: adminHeaders,
      })
      if (!catalogRules.catalog_rules?.length) {
        warn("Admin reglas de catalogo", "No hay reglas visibles.")
      } else {
        pass(
          "Admin reglas de catalogo",
          `${catalogRules.catalog_rules.length} visibles`
        )
      }
    }
  }

  console.log("\nPlaybook P0 smoke")
  console.log(`Backend: ${backendUrl}`)
  console.log(`Storefront: ${storefrontUrl}`)
  console.log("")

  for (const check of checks) {
    const prefix =
      check.status === "OK" ? "[OK]" : check.status === "WARN" ? "[WARN]" : "[FAIL]"
    console.log(`${prefix} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
  }

  const failures = checks.filter((check) => check.status === "FAIL")
  const warnings = checks.filter((check) => check.status === "WARN")

  console.log("")
  console.log(
    `Resultado: ${failures.length} fallo(s), ${warnings.length} aviso(s), ${
      checks.length - failures.length - warnings.length
    } OK.`
  )

  if (failures.length) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
