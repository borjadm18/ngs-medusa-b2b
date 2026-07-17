import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright")

const outputDir = path.join(process.cwd(), "output", "playwright", "playbook-p0")
const storefrontUrl =
  process.env.STOREFRONT_SMOKE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://storefront-virid-three-41.vercel.app"
const backendUrl =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com"
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const demoEmail =
  process.env.DEMO_VISUAL_EMAIL || "compras+buyer@iberia-pro-installers.demo"
const demoPassword = process.env.DEMO_CUSTOMER_PASSWORD || "Demo123!"

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]

const chromeExecutableCandidates = [
  process.env.PLAYWRIGHT_CHROME_EXECUTABLE,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean)

const chromeExecutablePath = chromeExecutableCandidates.find((candidate) =>
  fs.existsSync(candidate)
)

const accountRoutes = [
  { name: "account", path: "/es/account" },
  { name: "company", path: "/es/account/company" },
  { name: "orders", path: "/es/account/orders" },
  { name: "quotes", path: "/es/account/quotes" },
  { name: "quick-order", path: "/es/account/quick-order" },
]

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

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
      `${options.method || "GET"} ${pathname} failed with ${response.status}: ${text.slice(
        0,
        260
      )}`
    )
  }

  return body
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const selectors = [
      "body *",
      "img",
      "button",
      "a",
      "input",
      "table",
      "[role='button']",
    ]
    const nodes = Array.from(document.querySelectorAll(selectors.join(",")))
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const dimensions = nodes
      .map((node) => {
        const rect = node.getBoundingClientRect()
        return {
          tag: node.tagName,
          text: (node.textContent || "").trim().slice(0, 80),
          rect: {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          },
          viewportWidth,
          viewportHeight,
        }
      })
      .filter((item) => item.rect.width > 0 && item.rect.height > 0)

    const brokenImages = Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)

    return {
      title: document.title,
      bodyText: document.body.innerText.slice(0, 1500),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      brokenImages,
      dimensions,
    }
  })
}

async function capture(page, name, route, viewportName, issues) {
  const url = new URL(route, storefrontUrl).toString()
  const response = await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 60000,
  })
  await page.screenshot({
    path: path.join(outputDir, `${viewportName}-${name}.png`),
    fullPage: true,
  })

  const inspection = await inspectPage(page)
  const pageIssues = []

  if (!response || response.status() >= 500) {
    pageIssues.push(`HTTP ${response?.status() || "sin respuesta"}`)
  }

  if (
    inspection.bodyText.includes("Application error") ||
    inspection.bodyText.includes("Digest:")
  ) {
    pageIssues.push("Application error visible")
  }

  if (
    inspection.title.toLowerCase().includes("login") &&
    inspection.bodyText.includes("Vercel")
  ) {
    pageIssues.push("Vercel deployment protection/login visible")
  }

  if (inspection.scrollWidth > inspection.clientWidth + 2) {
    pageIssues.push(
      `overflow horizontal ${inspection.scrollWidth}px > ${inspection.clientWidth}px`
    )
  }

  if (inspection.brokenImages.length) {
    pageIssues.push(`${inspection.brokenImages.length} imagen(es) rotas`)
  }

  if (pageIssues.length) {
    issues.push({
      page: name,
      viewport: viewportName,
      route,
      issues: pageIssues,
    })
  }

  return {
    name,
    viewport: viewportName,
    route,
    status: response?.status() || 0,
    title: inspection.title,
    issues: pageIssues,
  }
}

async function main() {
  ensureDir(outputDir)

  const auth = await backendRequest("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({ email: demoEmail, password: demoPassword }),
  })

  if (!auth?.token) {
    throw new Error(`No token returned for ${demoEmail}`)
  }

  const quotes = await backendRequest("/store/quotes?order=-created_at", {
    headers: { authorization: `Bearer ${auth.token}` },
  }).catch(() => ({ quotes: [] }))
  const firstQuote = quotes.quotes?.[0]

  const browser = await chromium.launch({
    headless: true,
    ...(chromeExecutablePath ? { executablePath: chromeExecutablePath } : {}),
  })
  const results = []
  const issues = []

  for (const viewport of viewports) {
    const publicContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    })
    const publicPage = await publicContext.newPage()

    results.push(await capture(publicPage, "home-public", "/es", viewport.name, issues))
    results.push(
      await capture(publicPage, "store-public", "/es/store", viewport.name, issues)
    )

    const firstProductLink = await publicPage
      .locator("a[href*='/products/'], a[href*='/products']")
      .first()
      .getAttribute("href")
      .catch(() => null)

    if (firstProductLink) {
      results.push(
        await capture(
          publicPage,
          "pdp-public",
          firstProductLink,
          viewport.name,
          issues
        )
      )
    } else {
      issues.push({
        page: "pdp-public",
        viewport: viewport.name,
        route: "/es/store",
        issues: ["No se encontro enlace a producto desde catalogo"],
      })
    }

    await publicContext.close()

    const authedContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    })
    await authedContext.addCookies([
      {
        name: "_medusa_jwt",
        value: auth.token,
        url: storefrontUrl,
      },
      {
        name: "_medusa_cache_id",
        value: `qa-visual-${viewport.name}`,
        url: storefrontUrl,
      },
    ])
    const authedPage = await authedContext.newPage()

    for (const route of accountRoutes) {
      results.push(
        await capture(authedPage, route.name, route.path, viewport.name, issues)
      )
    }

    if (firstQuote?.id) {
      results.push(
        await capture(
          authedPage,
          "quote-detail",
          `/es/account/quotes/details/${firstQuote.id}`,
          viewport.name,
          issues
        )
      )
    }

    await authedContext.close()
  }

  await browser.close()

  const report = {
    generated_at: new Date().toISOString(),
    storefront: storefrontUrl,
    backend: backendUrl,
    demo_user: demoEmail,
    screenshots_dir: outputDir,
    results,
    issues,
  }

  fs.writeFileSync(
    path.join(outputDir, "report.json"),
    JSON.stringify(report, null, 2)
  )

  console.log(`Visual QA report: ${path.join(outputDir, "report.json")}`)
  console.log(`Screenshots: ${outputDir}`)
  console.log(`Pages checked: ${results.length}`)

  if (issues.length) {
    console.log("")
    console.log("Issues:")
    for (const issue of issues) {
      console.log(
        `- ${issue.viewport} ${issue.page} ${issue.route}: ${issue.issues.join(
          "; "
        )}`
      )
    }
    process.exit(1)
  }

  console.log("No visual smoke issues detected.")
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
