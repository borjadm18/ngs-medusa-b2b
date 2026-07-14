import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const rootDir = process.cwd()
const profilesDir = path.join(rootDir, "profiles")
const storefrontPublicImagesDir = path.join(
  rootDir,
  "apps",
  "storefront",
  "public",
  "images"
)

const usage = `Usage:
  pnpm validate:client-profiles
  pnpm validate:client-profiles -- --id ngs
  pnpm validate:client-profiles -- --strict-assets

Options:
  --id             Validate a single profile folder.
  --strict-assets  Treat missing local /images/<profile>/... assets as errors.
`

const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {
    id: null,
    strictAssets: false,
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === "--") {
      continue
    }

    if (arg === "--strict-assets") {
      options.strictAssets = true
      continue
    }

    if (arg === "--id") {
      options.id = args[index + 1]
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}\n\n${usage}`)
  }

  return options
}

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"))

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0

const isHexColor = (value) =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)

const parseCsvRow = (row) => {
  const result = []
  let current = ""
  let quoted = false

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index]
    const next = row[index + 1]

    if (character === '"' && quoted && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (character === '"') {
      quoted = !quoted
      continue
    }

    if (character === "," && !quoted) {
      result.push(current)
      current = ""
      continue
    }

    current += character
  }

  result.push(current)
  return result.map((value) => value.trim())
}

const collectStringValues = (value, predicate, result = []) => {
  if (typeof value === "string" && predicate(value)) {
    result.push(value)
    return result
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, predicate, result))
    return result
  }

  if (isObject(value)) {
    Object.values(value).forEach((item) =>
      collectStringValues(item, predicate, result)
    )
  }

  return result
}

const makeReporter = (profileId) => {
  const errors = []
  const warnings = []

  return {
    errors,
    warnings,
    error: (message) => errors.push(`[${profileId}] ${message}`),
    warn: (message) => warnings.push(`[${profileId}] ${message}`),
  }
}

const validateLinks = (links, label, reporter) => {
  if (!Array.isArray(links) || !links.length) {
    reporter.error(`${label} must contain at least one link`)
    return
  }

  links.forEach((link, index) => {
    if (!isObject(link)) {
      reporter.error(`${label}[${index}] must be an object`)
      return
    }

    if (!isNonEmptyString(link.label)) {
      reporter.error(`${label}[${index}].label is required`)
    }

    if (!isNonEmptyString(link.href)) {
      reporter.error(`${label}[${index}].href is required`)
    }

    if (link.children !== undefined) {
      validateLinks(link.children, `${label}[${index}].children`, reporter)
    }
  })
}

const validateClientProfile = (profileId, profile, reporter) => {
  if (profile.id !== profileId) {
    reporter.error(`client-profile.json id must match folder name "${profileId}"`)
  }

  if (!isObject(profile.brand)) {
    reporter.error("brand is required")
    return
  }

  ;["name", "legalName", "tagline"].forEach((field) => {
    if (!isNonEmptyString(profile.brand[field])) {
      reporter.error(`brand.${field} is required`)
    }
  })

  ;["light", "dark"].forEach((field) => {
    if (!isNonEmptyString(profile.brand.logo?.[field])) {
      reporter.error(`brand.logo.${field} is required`)
    }
  })

  ;["background", "foreground", "primary", "accent", "muted", "border"].forEach(
    (field) => {
      if (!isHexColor(profile.brand.colors?.[field])) {
        reporter.error(`brand.colors.${field} must be a #RRGGBB color`)
      }
    }
  )

  if (!isNonEmptyString(profile.seo?.title)) {
    reporter.error("seo.title is required")
  }

  if (!isNonEmptyString(profile.seo?.description)) {
    reporter.error("seo.description is required")
  }

  if (!isNonEmptyString(profile.markets?.defaultCountryCode)) {
    reporter.error("markets.defaultCountryCode is required")
  }

  if (!Array.isArray(profile.markets?.languages) || !profile.markets.languages.length) {
    reporter.error("markets.languages must contain at least one language")
  }

  if (!isNonEmptyString(profile.markets?.currency)) {
    reporter.error("markets.currency is required")
  }

  validateLinks(profile.navigation?.main, "navigation.main", reporter)

  if (!Array.isArray(profile.footer?.columns) || !profile.footer.columns.length) {
    reporter.error("footer.columns must contain at least one column")
  } else {
    profile.footer.columns.forEach((column, index) => {
      if (!isNonEmptyString(column.title)) {
        reporter.error(`footer.columns[${index}].title is required`)
      }
      validateLinks(column.links, `footer.columns[${index}].links`, reporter)
    })
  }

  if (!isNonEmptyString(profile.fallbacks?.productCategoryLabel)) {
    reporter.error("fallbacks.productCategoryLabel is required")
  }

  if (!isNonEmptyString(profile.fallbacks?.productTechnicalDescription)) {
    reporter.error("fallbacks.productTechnicalDescription is required")
  }
}

const validateHomepage = (homepage, reporter) => {
  ;[
    "heroTitle",
    "heroBody",
    "primaryCtaLabel",
    "primaryCtaHref",
    "heroImage",
    "categoryTitle",
    "catalogTitle",
    "commercialCtaTitle",
  ].forEach((field) => {
    if (!isNonEmptyString(homepage[field])) {
      reporter.error(`homepage-content.json ${field} is required`)
    }
  })

  if (!Array.isArray(homepage.featuredCategories) || !homepage.featuredCategories.length) {
    reporter.error("homepage-content.json featuredCategories must not be empty")
  } else {
    homepage.featuredCategories.forEach((category, index) => {
      if (!isNonEmptyString(category.title)) {
        reporter.error(`featuredCategories[${index}].title is required`)
      }
      if (!isNonEmptyString(category.handle)) {
        reporter.error(`featuredCategories[${index}].handle is required`)
      }
    })
  }

  if (!Array.isArray(homepage.productFallbackImages)) {
    reporter.warn("homepage-content.json productFallbackImages is missing")
  }
}

const validatePackagingCsv = (filePath, reporter) => {
  if (!fs.existsSync(filePath)) {
    reporter.warn("product-packaging.csv is missing")
    return
  }

  const text = fs.readFileSync(filePath, "utf8").trim()

  if (!text) {
    reporter.warn("product-packaging.csv is empty")
    return
  }

  const [headerLine, ...lines] = text.split(/\r?\n/)
  const headers = parseCsvRow(headerLine)
  const requiredHeaders = [
    "sku",
    "variant_id",
    "sales_unit",
    "minimum_order_quantity",
    "quantity_increment",
    "units_per_box",
    "boxes_per_pallet",
    "package_weight",
    "package_dimensions",
  ]

  requiredHeaders
    .filter((header) => !headers.includes(header))
    .forEach((header) =>
      reporter.error(`product-packaging.csv missing column ${header}`)
    )

  lines
    .filter((line) => line.trim())
    .forEach((line, index) => {
      const lineNumber = index + 2
      const values = parseCsvRow(line)
      const row = headers.reduce((acc, header, valueIndex) => {
        acc[header] = values[valueIndex] || ""
        return acc
      }, {})

      if (!row.sku && !row.variant_id) {
        reporter.error(`product-packaging.csv line ${lineNumber} needs sku or variant_id`)
      }

      if (row.sales_unit && !["unit", "box"].includes(row.sales_unit)) {
        reporter.error(`product-packaging.csv line ${lineNumber} sales_unit must be unit or box`)
      }

      ;["minimum_order_quantity", "quantity_increment", "units_per_box"].forEach(
        (field) => {
          const value = Number(row[field])
          if (!Number.isInteger(value) || value <= 0) {
            reporter.error(`product-packaging.csv line ${lineNumber} ${field} must be positive integer`)
          }
        }
      )
    })
}

const validateProductCatalogCsv = (filePath, reporter) => {
  if (!fs.existsSync(filePath)) {
    reporter.warn("product-catalog.csv is missing; product seed will be skipped")
    return
  }

  const text = fs.readFileSync(filePath, "utf8").trim()

  if (!text) {
    reporter.warn("product-catalog.csv is empty")
    return
  }

  const [headerLine, ...lines] = text.split(/\r?\n/)
  const headers = parseCsvRow(headerLine)
  const requiredHeaders = [
    "handle",
    "title",
    "category",
    "description",
    "sku",
    "variant_title",
    "color",
    "price_eur",
    "image_url",
  ]

  requiredHeaders
    .filter((header) => !headers.includes(header))
    .forEach((header) =>
      reporter.error(`product-catalog.csv missing column ${header}`)
    )

  lines
    .filter((line) => line.trim())
    .forEach((line, index) => {
      const lineNumber = index + 2
      const values = parseCsvRow(line)
      const row = headers.reduce((acc, header, valueIndex) => {
        acc[header] = values[valueIndex] || ""
        return acc
      }, {})

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.handle || "")) {
        reporter.error(`product-catalog.csv line ${lineNumber} handle must be kebab-case`)
      }

      if (!isNonEmptyString(row.title) || !isNonEmptyString(row.category)) {
        reporter.error(`product-catalog.csv line ${lineNumber} title and category are required`)
      }

      if (!isNonEmptyString(row.sku)) {
        reporter.error(`product-catalog.csv line ${lineNumber} sku is required`)
      }

      const price = Number(row.price_eur)
      if (!Number.isFinite(price) || price <= 0) {
        reporter.error(`product-catalog.csv line ${lineNumber} price_eur must be positive`)
      }
    })
}

const validateAssets = ({
  profileId,
  profileDir,
  profile,
  homepage,
  reporter,
  strictAssets,
}) => {
  const imagePaths = [
    profile.brand?.logo?.light,
    profile.brand?.logo?.dark,
    ...collectStringValues(homepage, (value) =>
      value.startsWith(`/images/${profileId}/`)
    ),
  ].filter(Boolean)
  const uniquePaths = [...new Set(imagePaths)]

  uniquePaths.forEach((imagePath) => {
    const relativeAsset = imagePath.replace(`/images/${profileId}/`, "")
    const profileAssetPath = path.join(profileDir, "assets", relativeAsset)
    const publicAssetPath = path.join(
      storefrontPublicImagesDir,
      profileId,
      relativeAsset
    )

    if (!fs.existsSync(profileAssetPath) && !fs.existsSync(publicAssetPath)) {
      const message = `missing asset ${imagePath} (expected profiles/${profileId}/assets/${relativeAsset} or apps/storefront/public/images/${profileId}/${relativeAsset})`
      if (strictAssets) {
        reporter.error(message)
      } else {
        reporter.warn(message)
      }
    }
  })
}

const validateProfile = (profileId, options) => {
  const profileDir = path.join(profilesDir, profileId)
  const reporter = makeReporter(profileId)
  const profilePath = path.join(profileDir, "client-profile.json")
  const homepagePath = path.join(profileDir, "homepage-content.json")

  if (!fs.existsSync(profilePath)) {
    reporter.error("client-profile.json is missing")
  }

  if (!fs.existsSync(homepagePath)) {
    reporter.error("homepage-content.json is missing")
  }

  if (reporter.errors.length) {
    return reporter
  }

  const profile = readJson(profilePath)
  const homepage = readJson(homepagePath)

  validateClientProfile(profileId, profile, reporter)
  validateHomepage(homepage, reporter)
  validatePackagingCsv(path.join(profileDir, "product-packaging.csv"), reporter)
  validateProductCatalogCsv(path.join(profileDir, "product-catalog.csv"), reporter)
  validateAssets({
    profileId,
    profileDir,
    profile,
    homepage,
    reporter,
    strictAssets: options.strictAssets,
  })

  return reporter
}

try {
  const options = parseArgs()
  const profileIds = options.id
    ? [options.id]
    : fs
        .readdirSync(profilesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()

  if (!profileIds.length) {
    throw new Error("No profiles found in ./profiles")
  }

  const reporters = profileIds.map((profileId) =>
    validateProfile(profileId, options)
  )
  const errors = reporters.flatMap((reporter) => reporter.errors)
  const warnings = reporters.flatMap((reporter) => reporter.warnings)

  warnings.forEach((warning) => console.warn(`WARN ${warning}`))
  errors.forEach((error) => console.error(`ERROR ${error}`))

  if (errors.length) {
    console.error(
      `Client profile validation failed: ${errors.length} error(s), ${warnings.length} warning(s)`
    )
    process.exit(1)
  }

  console.log(
    `Client profile validation passed: ${profileIds.length} profile(s), ${warnings.length} warning(s)`
  )
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
