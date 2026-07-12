import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const rootDir = process.cwd()
const profilesDir = path.join(rootDir, "profiles")
const storefrontProfileDir = path.join(
  rootDir,
  "apps",
  "storefront",
  "src",
  "lib",
  "client-profile",
  "profiles"
)
const storefrontPublicDir = path.join(
  rootDir,
  "apps",
  "storefront",
  "public",
  "images"
)
const generatedRegistryPath = path.join(
  rootDir,
  "apps",
  "storefront",
  "src",
  "lib",
  "client-profile",
  "generated-profiles.ts"
)
const generatedBackendProfileDir = path.join(
  rootDir,
  "apps",
  "backend",
  "src",
  "migration-scripts",
  "generated-client-profiles"
)
const generatedBackendPackagingRegistryPath = path.join(
  generatedBackendProfileDir,
  "product-packaging-registry.ts"
)

const requiredProfileKeys = [
  "id",
  "brand",
  "seo",
  "markets",
  "navigation",
  "footer",
  "fallbacks",
]

const requiredHomepageKeys = [
  "heroTitle",
  "heroBody",
  "heroImage",
  "categoryTitle",
  "featuredCategories",
  "catalogTitle",
  "commercialCtaTitle",
]

const assertInside = (targetPath, expectedParent) => {
  const relative = path.relative(expectedParent, targetPath)

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside ${expectedParent}: ${targetPath}`)
  }
}

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

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

const toPositiveInteger = (value, label, lineNumber) => {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`${label} must be a positive integer on CSV line ${lineNumber}`)
  }

  return numberValue
}

const toPositiveNumberOrNull = (value, label, lineNumber) => {
  if (!String(value ?? "").trim()) {
    return null
  }

  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(`${label} must be a positive number on CSV line ${lineNumber}`)
  }

  return numberValue
}

const readPackagingCsv = (filePath) => {
  const text = fs.readFileSync(filePath, "utf8").trim()

  if (!text) {
    return []
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
  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  )

  if (missingHeaders.length) {
    throw new Error(
      `${path.relative(rootDir, filePath)} is missing CSV columns: ${missingHeaders.join(
        ", "
      )}`
    )
  }

  return lines
    .filter((line) => line.trim())
    .map((line, index) => {
      const lineNumber = index + 2
      const values = parseCsvRow(line)
      const record = headers.reduce((acc, header, valueIndex) => {
        acc[header] = values[valueIndex] || ""
        return acc
      }, {})

      if (!record.sku && !record.variant_id) {
        throw new Error(`Packaging CSV line ${lineNumber} needs sku or variant_id`)
      }

      if (!["unit", "box"].includes(record.sales_unit)) {
        throw new Error(
          `sales_unit must be unit or box on CSV line ${lineNumber}`
        )
      }

      return {
        sku: record.sku || null,
        variant_id: record.variant_id || null,
        sales_unit: record.sales_unit,
        minimum_order_quantity: toPositiveInteger(
          record.minimum_order_quantity,
          "minimum_order_quantity",
          lineNumber
        ),
        quantity_increment: toPositiveInteger(
          record.quantity_increment,
          "quantity_increment",
          lineNumber
        ),
        units_per_box: toPositiveInteger(
          record.units_per_box,
          "units_per_box",
          lineNumber
        ),
        boxes_per_pallet: toPositiveNumberOrNull(
          record.boxes_per_pallet,
          "boxes_per_pallet",
          lineNumber
        ),
        package_weight: toPositiveNumberOrNull(
          record.package_weight,
          "package_weight",
          lineNumber
        ),
        package_dimensions: record.package_dimensions || null,
      }
    })
}

const copyDirectory = (sourceDir, targetDir) => {
  if (!fs.existsSync(sourceDir)) {
    return false
  }

  assertInside(targetDir, storefrontPublicDir)
  fs.mkdirSync(targetDir, { recursive: true })
  fs.cpSync(sourceDir, targetDir, { recursive: true })
  return true
}

const validateRequiredKeys = (label, data, keys) => {
  const missingKeys = keys.filter((key) => data[key] === undefined)

  if (missingKeys.length) {
    throw new Error(`${label} is missing: ${missingKeys.join(", ")}`)
  }
}

const toIdentifier = (profileId) => {
  return profileId
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[0-9]/, "_$&")
}

const profileIds = fs
  .readdirSync(profilesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

if (!profileIds.length) {
  throw new Error("No profiles found in ./profiles")
}

const registryEntries = []
const importLines = []
const backendPackagingImportLines = []
const backendPackagingRegistryEntries = []

for (const profileId of profileIds) {
  const sourceProfilePath = path.join(
    profilesDir,
    profileId,
    "client-profile.json"
  )
  const sourceHomepagePath = path.join(
    profilesDir,
    profileId,
    "homepage-content.json"
  )
  const sourcePackagingPath = path.join(
    profilesDir,
    profileId,
    "product-packaging.csv"
  )

  if (!fs.existsSync(sourceProfilePath) || !fs.existsSync(sourceHomepagePath)) {
    console.warn(`Skipping ${profileId}: missing client-profile or homepage`)
    continue
  }

  const profile = readJson(sourceProfilePath)
  const homepage = readJson(sourceHomepagePath)

  validateRequiredKeys(`${profileId}/client-profile.json`, profile, requiredProfileKeys)
  validateRequiredKeys(
    `${profileId}/homepage-content.json`,
    homepage,
    requiredHomepageKeys
  )

  if (profile.id !== profileId) {
    throw new Error(
      `${profileId}/client-profile.json id must match folder name (${profileId})`
    )
  }

  const targetProfilePath = path.join(storefrontProfileDir, `${profileId}.json`)
  const targetHomepagePath = path.join(
    storefrontProfileDir,
    `${profileId}-homepage.json`
  )

  assertInside(targetProfilePath, storefrontProfileDir)
  assertInside(targetHomepagePath, storefrontProfileDir)
  writeJson(targetProfilePath, profile)
  writeJson(targetHomepagePath, homepage)
  const identifier = toIdentifier(profileId)

  if (fs.existsSync(sourcePackagingPath)) {
    const packagingRules = readPackagingCsv(sourcePackagingPath)
    const targetPackagingPath = path.join(
      generatedBackendProfileDir,
      `${profileId}-product-packaging.json`
    )

    assertInside(targetPackagingPath, generatedBackendProfileDir)
    writeJson(targetPackagingPath, packagingRules)
    backendPackagingImportLines.push(
      `import ${identifier}Packaging from "./${profileId}-product-packaging.json"`
    )
    backendPackagingRegistryEntries.push(
      `  "${profileId}": ${identifier}Packaging,`
    )
    console.log(`Validated ${profileId} packaging rules (${packagingRules.length})`)
  }

  const copiedAssets = copyDirectory(
    path.join(profilesDir, profileId, "assets"),
    path.join(storefrontPublicDir, profileId)
  )

  importLines.push(`import ${identifier}Profile from "./profiles/${profileId}.json"`)
  importLines.push(
    `import ${identifier}Homepage from "./profiles/${profileId}-homepage.json"`
  )
  registryEntries.push(
    `  "${profileId}": {\n` +
      `    profile: ${identifier}Profile,\n` +
      `    homepage: ${identifier}Homepage,\n` +
      `  },`
  )

  console.log(
    `Synced ${profileId}` + (copiedAssets ? " with assets" : " without assets")
  )
}

if (!registryEntries.length) {
  throw new Error("No valid profiles were synced")
}

const generatedSource = `// Generated by scripts/sync-client-profile.mjs. Do not edit manually.\n${importLines.join(
  "\n"
)}\n\nexport const generatedProfileBundles = {\n${registryEntries.join(
  "\n"
)}\n}\n`

fs.writeFileSync(generatedRegistryPath, generatedSource, "utf8")
console.log(`Generated ${path.relative(rootDir, generatedRegistryPath)}`)

const generatedBackendPackagingSource = `// Generated by scripts/sync-client-profile.mjs. Do not edit manually.\n${backendPackagingImportLines.join(
  "\n"
)}\n\nexport const generatedProductPackagingProfiles = {\n${backendPackagingRegistryEntries.join(
  "\n"
)}\n}\n`

fs.mkdirSync(path.dirname(generatedBackendPackagingRegistryPath), {
  recursive: true,
})
fs.writeFileSync(
  generatedBackendPackagingRegistryPath,
  generatedBackendPackagingSource,
  "utf8"
)
console.log(
  `Generated ${path.relative(rootDir, generatedBackendPackagingRegistryPath)}`
)
