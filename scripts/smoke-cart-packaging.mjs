import fs from "node:fs"
import path from "node:path"

const demoUserEmail =
  process.env.SMOKE_CUSTOMER_EMAIL || "compras+buyer@iberia-pro-installers.demo"
const password = process.env.DEMO_CUSTOMER_PASSWORD || "Demo123!"
const testSku = process.env.SMOKE_CART_SKU || "NGS-EVO-MOUSE-BLK"
const requestTimeoutMs = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 45000)

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
  env.MEDUSA_BACKEND_URL ||
  "https://ngs-medusa-backend.onrender.com"
const publishableKey = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

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

async function request(pathname, options = {}) {
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
    const detail = typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body)
    throw new Error(`${options.method || "GET"} ${pathname} failed with ${response.status}: ${detail}`)
  }

  return body
}

async function requestExpectFailure(pathname, options = {}) {
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

  if (response.ok) {
    throw new Error(
      `${options.method || "GET"} ${pathname} unexpectedly succeeded: ${text.slice(0, 300)}`
    )
  }

  return {
    status: response.status,
    body: text,
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function main() {
  const auth = await request("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({ email: demoUserEmail, password }),
  })

  assert(auth?.token, `Login did not return a token for ${demoUserEmail}`)

  const headers = {
    authorization: `Bearer ${auth.token}`,
  }

  const { customer } = await request(
    "/store/customers/me?fields=*employee,*employee.company",
    { headers }
  )
  const companyId = customer?.employee?.company_id

  assert(companyId, `${demoUserEmail} is not attached to a B2B company`)

  const regions = await request("/store/regions?limit=10", { headers })
  const region =
    regions.regions?.find((item) =>
      item.countries?.some((country) => country.iso_2 === "es")
    ) || regions.regions?.[0]

  assert(region?.id, "No store region found for cart smoke")

  const quickOrder = await request("/store/quick-order/resolve", {
    method: "POST",
    headers,
    body: JSON.stringify({ skus: [testSku], region_id: region.id }),
  })

  const item = quickOrder.items?.[0]
  const packaging = item?.packaging

  assert(item?.variant?.id, `SKU ${testSku} was not resolved`)
  assert(packaging?.units_per_box > 1, `SKU ${testSku} does not have box packaging`)

  const boxQuantity = 2
  const unitQuantity = boxQuantity * Number(packaging.units_per_box)
  const metadata = {
    purchase_unit: "box",
    package_quantity: boxQuantity,
    units_per_box: packaging.units_per_box,
    unit_quantity: unitQuantity,
    minimum_order_quantity: packaging.minimum_order_quantity,
    quantity_increment: packaging.quantity_increment,
    boxes_per_pallet: packaging.boxes_per_pallet,
    package_weight: packaging.package_weight,
    package_dimensions: packaging.package_dimensions,
  }

  const createdCart = await request("/store/carts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      region_id: region.id,
      metadata: { company_id: companyId, smoke_test: "cart-packaging" },
    }),
  })
  const cartId = createdCart.cart?.id

  assert(cartId, "Cart create response did not include cart.id")

  const cartWithItem = await request(
    `/store/carts/${cartId}/line-items/bulk?fields=id,*items,+items.metadata,*items.variant`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        line_items: [
          {
            variant_id: item.variant.id,
            quantity: unitQuantity,
            metadata,
          },
        ],
      }),
    }
  )

  const line = cartWithItem.cart?.items?.find(
    (cartLine) => cartLine.variant_id === item.variant.id
  )

  assert(line?.id, "Bulk add did not return the cart line")
  assert(line.quantity === unitQuantity, `Expected ${unitQuantity} units, got ${line.quantity}`)
  assert(line.metadata?.purchase_unit === "box", "Cart line lost purchase_unit metadata")
  assert(
    Number(line.metadata?.package_quantity) === boxQuantity,
    "Cart line lost package_quantity metadata"
  )
  assert(
    Number(line.metadata?.units_per_box) === Number(packaging.units_per_box),
    "Cart line lost units_per_box metadata"
  )
  assert(
    Number(line.metadata?.boxes_per_pallet || 0) > 0,
    "Cart line does not include boxes_per_pallet"
  )
  assert(
    Number(line.metadata?.package_weight || 0) > 0,
    "Cart line does not include package_weight"
  )

  const invalidUpdate = await requestExpectFailure(
    `/store/carts/${cartId}/line-items/${line.id}/b2b?fields=id,*items,+items.metadata`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        quantity: 1,
        metadata: {
          ...metadata,
          unit_quantity: 1,
          package_quantity: 1,
        },
      }),
    }
  )

  try {
    await request(`/store/carts/${cartId}/line-items/${line.id}`, {
      method: "DELETE",
      headers,
    })
  } catch {
    // The smoke result is still valid if cleanup is not available.
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        backendUrl,
        customer: demoUserEmail,
        sku: testSku,
        cart: cartId,
        line: line.id,
        boxQuantity,
        unitQuantity,
        unitsPerBox: packaging.units_per_box,
        boxesPerPallet: packaging.boxes_per_pallet,
        packageWeight: packaging.package_weight,
        invalidUpdateStatus: invalidUpdate.status,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
