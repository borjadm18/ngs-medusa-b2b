import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"

const rootDir = process.cwd()
const profilesDir = path.join(rootDir, "profiles")
const templatesDir = path.join(rootDir, "templates")

const usage = `Usage:
  pnpm create:client-profile -- --id <cliente> --name "Cliente"

Options:
  --id       Perfil slug en kebab-case. Ej: ngs, acme-industrial
  --name     Nombre comercial visible. Ej: "ACME Industrial"
  --legal    Nombre legal opcional
  --force    Permite sobrescribir archivos existentes del perfil
`

const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {
    force: false,
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === "--") {
      continue
    }

    if (arg === "--force") {
      options.force = true
      continue
    }

    if (arg === "--id" || arg === "--name" || arg === "--legal") {
      options[arg.slice(2)] = args[index + 1]
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}\n\n${usage}`)
  }

  return options
}

const assertValidId = (profileId) => {
  if (!profileId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileId)) {
    throw new Error(
      "--id must be kebab-case with lowercase letters, numbers and hyphens"
    )
  }
}

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"))

const writeJson = (filePath, data, force) => {
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`${path.relative(rootDir, filePath)} already exists. Use --force to overwrite.`)
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

const copyFile = (sourcePath, targetPath, force) => {
  if (fs.existsSync(targetPath) && !force) {
    throw new Error(`${path.relative(rootDir, targetPath)} already exists. Use --force to overwrite.`)
  }

  fs.copyFileSync(sourcePath, targetPath)
}

const replaceClientImagePath = (value, profileId) => {
  if (typeof value !== "string") {
    return value
  }

  return value.replaceAll("/images/client/", `/images/${profileId}/`)
}

const mapDeep = (value, mapper) => {
  if (Array.isArray(value)) {
    return value.map((item) => mapDeep(item, mapper))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapDeep(item, mapper)])
    )
  }

  return mapper(value)
}

const titleCaseFromId = (profileId) =>
  profileId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const createProfile = ({ id, name, legal, force }) => {
  assertValidId(id)

  const brandName = name || titleCaseFromId(id)
  const legalName = legal || brandName
  const targetDir = path.join(profilesDir, id)
  const assetsDir = path.join(targetDir, "assets")

  if (fs.existsSync(targetDir) && !force) {
    throw new Error(`profiles/${id} already exists. Use --force to overwrite.`)
  }

  fs.mkdirSync(assetsDir, { recursive: true })

  const profile = readJson(path.join(templatesDir, "client-profile.example.json"))
  profile.id = id
  profile.brand.name = brandName
  profile.brand.legalName = legalName
  profile.brand.logo.light = `/images/${id}/logo-light.png`
  profile.brand.logo.dark = `/images/${id}/logo-dark.png`
  profile.seo.title = `${brandName} | Portal B2B`
  profile.seo.description = `Portal B2B ${brandName} para compra profesional con precios por cuenta, packaging industrial y presupuestos.`
  profile.footer.description = `Soluciones profesionales ${brandName} para empresas que necesitan comprar con precision, control y disponibilidad.`

  const homepageTemplate = readJson(
    path.join(templatesDir, "homepage-content.example.json")
  )
  const homepage = mapDeep(homepageTemplate, (value) =>
    replaceClientImagePath(value, id)
  )
  homepage.heroBadgePrimary = brandName
  homepage.heroTitle = `Compra profesional ${brandName} con reglas reales de empresa.`
  homepage.heroImageAlt = `Producto profesional ${brandName} en contexto B2B`

  writeJson(path.join(targetDir, "client-profile.json"), profile, force)
  writeJson(path.join(targetDir, "homepage-content.json"), homepage, force)
  copyFile(
    path.join(templatesDir, "product-packaging.example.csv"),
    path.join(targetDir, "product-packaging.csv"),
    force
  )

  const readme = `# ${brandName} Profile

Perfil generado para activar una demo B2B industrial sobre el template Medusa.

## Archivos

- \`client-profile.json\`: marca, SEO, navegacion, footer y fallbacks.
- \`homepage-content.json\`: hero, bloques comerciales, categorias y productos destacados.
- \`product-packaging.csv\`: reglas demo de packaging por SKU.
- \`assets/\`: logos e imagenes que se publicaran como \`/images/${id}/...\`.

## Activacion

\`\`\`bash
pnpm sync:client-profile
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id} pnpm --filter @b2b-starter/storefront build
\`\`\`

Para produccion, configura \`NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}\` en Vercel y \`B2B_CLIENT_PROFILE=${id}\` en Render si quieres sembrar packaging de este perfil.
`

  fs.writeFileSync(path.join(targetDir, "README.md"), readme, "utf8")

  const syncResult = spawnSync(process.execPath, ["scripts/sync-client-profile.mjs"], {
    cwd: rootDir,
    stdio: "inherit",
  })

  if (syncResult.status !== 0) {
    throw new Error("Profile created, but sync-client-profile failed")
  }

  console.log(`Created profiles/${id}`)
}

try {
  const options = parseArgs()

  if (!options.id) {
    throw new Error(`Missing --id\n\n${usage}`)
  }

  createProfile(options)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
