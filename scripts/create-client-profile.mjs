import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"

const rootDir = process.cwd()
const profilesDir = path.join(rootDir, "profiles")
const templatesDir = path.join(rootDir, "templates")

const usage = `Usage:
  pnpm create:client-profile -- --id <cliente> --name "Cliente"
  pnpm create:client-profile -- --id acme --name "ACME" --from ngs --accent "#d71920"

Options:
  --id       Perfil slug en kebab-case. Ej: ngs, acme-industrial
  --name     Nombre comercial visible. Ej: "ACME Industrial"
  --legal    Nombre legal opcional
  --tagline  Tagline visible opcional
  --from     Perfil base existente en ./profiles o "template". Por defecto: template
  --accent   Color acento hex. Ej: "#d71920"
  --country  Pais por defecto. Por defecto: es
  --currency Moneda. Por defecto: EUR
  --force    Permite sobrescribir archivos existentes del perfil
  --no-sync  Crea archivos sin ejecutar sync-client-profile
  --dry-run  Muestra lo que se crearia sin escribir archivos
`

const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {
    force: false,
    sync: true,
    dryRun: false,
    from: "template",
    country: "es",
    currency: "EUR",
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

    if (arg === "--no-sync") {
      options.sync = false
      continue
    }

    if (arg === "--dry-run") {
      options.dryRun = true
      continue
    }

    if (
      arg === "--id" ||
      arg === "--name" ||
      arg === "--legal" ||
      arg === "--tagline" ||
      arg === "--from" ||
      arg === "--accent" ||
      arg === "--country" ||
      arg === "--currency"
    ) {
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

const assertHexColor = (color, label) => {
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new Error(`${label} must be a hex color like #d71920`)
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

const writeJsonMaybe = (filePath, data, force, dryRun) => {
  if (dryRun) {
    console.log(`[dry-run] write ${path.relative(rootDir, filePath)}`)
    return
  }

  writeJson(filePath, data, force)
}

const copyFileMaybe = (sourcePath, targetPath, force, dryRun) => {
  if (dryRun) {
    console.log(
      `[dry-run] copy ${path.relative(rootDir, sourcePath)} -> ${path.relative(
        rootDir,
        targetPath
      )}`
    )
    return
  }

  copyFile(sourcePath, targetPath, force)
}

const writeTextMaybe = (filePath, content, force, dryRun) => {
  if (dryRun) {
    console.log(`[dry-run] write ${path.relative(rootDir, filePath)}`)
    return
  }

  if (fs.existsSync(filePath) && !force) {
    throw new Error(`${path.relative(rootDir, filePath)} already exists. Use --force to overwrite.`)
  }

  fs.writeFileSync(filePath, content, "utf8")
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

const resolveProfileSource = (from) => {
  if (!from || from === "template") {
    return {
      profilePath: path.join(templatesDir, "client-profile.example.json"),
      homepagePath: path.join(templatesDir, "homepage-content.example.json"),
      packagingPath: path.join(templatesDir, "product-packaging.example.csv"),
      assetsDir: null,
    }
  }

  assertValidId(from)

  const sourceDir = path.join(profilesDir, from)
  const profilePath = path.join(sourceDir, "client-profile.json")
  const homepagePath = path.join(sourceDir, "homepage-content.json")
  const packagingPath = path.join(sourceDir, "product-packaging.csv")

  if (!fs.existsSync(profilePath) || !fs.existsSync(homepagePath)) {
    throw new Error(`profiles/${from} is missing client-profile.json or homepage-content.json`)
  }

  return {
    profilePath,
    homepagePath,
    packagingPath: fs.existsSync(packagingPath)
      ? packagingPath
      : path.join(templatesDir, "product-packaging.example.csv"),
    assetsDir: path.join(sourceDir, "assets"),
  }
}

const buildActivationChecklist = ({
  id,
  brandName,
  from,
  country,
  currency,
}) => `# Activacion ${brandName}

Checklist para convertir este perfil en una demo B2B funcional.

## 1. Revisar perfil

- [ ] \`client-profile.json\`: marca, SEO, colores, logo, menu, footer y fallbacks.
- [ ] \`homepage-content.json\`: hero, categorias, bloques visuales, CTAs y productos destacados.
- [ ] \`product-packaging.csv\`: SKUs reales, unidades/caja, minimos, multiplos, pallets y peso.
- [ ] \`assets/\`: logos e imagenes con rutas \`/images/${id}/...\`.

## 2. Sincronizar artefactos

\`\`\`bash
pnpm sync:client-profile
\`\`\`

## 3. Activar storefront local

\`\`\`env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}
\`\`\`

\`\`\`bash
pnpm --filter @b2b-starter/storefront build
\`\`\`

## 4. Activar backend/seed

\`\`\`env
B2B_CLIENT_PROFILE=${id}
\`\`\`

Si hay reglas de packaging nuevas, ejecutar seed/migracion segun entorno.

## 5. Deploy

- [ ] Vercel storefront: \`NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}\`.
- [ ] Render backend: \`B2B_CLIENT_PROFILE=${id}\`.
- [ ] Confirmar region/pais por defecto: \`${country}\`.
- [ ] Confirmar moneda: \`${currency}\`.
- [ ] Confirmar assets visibles en home y PDP.

## 6. QA minimo

- [ ] Home carga en desktop y mobile.
- [ ] Menu y mega menu muestran enlaces correctos.
- [ ] Catalogo lista productos con imagen.
- [ ] PDP permite unidad/caja y muestra packaging.
- [ ] Carrito muestra precio solo con login y packaging/logistica.
- [ ] Presupuesto exporta CSV/PDF si aplica.
- [ ] Admin edita home, brand profile, assets y packaging.

## Origen

Generado desde \`${from || "template"}\`.
`

const buildEnvExample = ({ id }) => `# Storefront
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}

# Backend seed/import helpers
B2B_CLIENT_PROFILE=${id}
`

const createProfile = ({
  id,
  name,
  legal,
  tagline,
  from,
  accent,
  country,
  currency,
  force,
  sync,
  dryRun,
}) => {
  assertValidId(id)
  assertHexColor(accent, "--accent")

  const brandName = name || titleCaseFromId(id)
  const legalName = legal || brandName
  const targetDir = path.join(profilesDir, id)
  const assetsDir = path.join(targetDir, "assets")
  const source = resolveProfileSource(from)

  if (fs.existsSync(targetDir) && !force) {
    throw new Error(`profiles/${id} already exists. Use --force to overwrite.`)
  }

  if (!dryRun) {
    fs.mkdirSync(assetsDir, { recursive: true })
  } else {
    console.log(`[dry-run] create ${path.relative(rootDir, targetDir)}`)
  }

  const profile = readJson(source.profilePath)
  profile.id = id
  profile.brand.name = brandName
  profile.brand.legalName = legalName
  profile.brand.tagline =
    tagline || profile.brand.tagline || "Portal B2B profesional para empresas"
  profile.brand.logo.light = `/images/${id}/logo-light.png`
  profile.brand.logo.dark = `/images/${id}/logo-dark.png`
  profile.brand.colors.accent = accent || profile.brand.colors.accent
  profile.seo.title = `${brandName} | Portal B2B`
  profile.seo.description = `Portal B2B ${brandName} para compra profesional con precios por cuenta, packaging industrial y presupuestos.`
  profile.markets.defaultCountryCode = country || profile.markets.defaultCountryCode
  profile.markets.currency = currency || profile.markets.currency
  profile.footer.description = `Soluciones profesionales ${brandName} para empresas que necesitan comprar con precision, control y disponibilidad.`

  const homepageTemplate = readJson(source.homepagePath)
  const homepage = mapDeep(homepageTemplate, (value) =>
    replaceClientImagePath(value, id)
  )
  homepage.heroBadgePrimary = brandName
  homepage.heroTitle = `Compra profesional ${brandName} con reglas reales de empresa.`
  homepage.heroImageAlt = `Producto profesional ${brandName} en contexto B2B`

  writeJsonMaybe(
    path.join(targetDir, "client-profile.json"),
    profile,
    force,
    dryRun
  )
  writeJsonMaybe(
    path.join(targetDir, "homepage-content.json"),
    homepage,
    force,
    dryRun
  )
  copyFileMaybe(
    source.packagingPath,
    path.join(targetDir, "product-packaging.csv"),
    force,
    dryRun
  )

  if (source.assetsDir && fs.existsSync(source.assetsDir)) {
    if (dryRun) {
      console.log(
        `[dry-run] copy ${path.relative(rootDir, source.assetsDir)} -> ${path.relative(
          rootDir,
          assetsDir
        )}`
      )
    } else {
      fs.cpSync(source.assetsDir, assetsDir, { recursive: true })
    }
  }

  const readme = `# ${brandName} Profile

Perfil generado para activar una demo B2B industrial sobre el template Medusa.

## Archivos

- \`client-profile.json\`: marca, SEO, navegacion, footer y fallbacks.
- \`homepage-content.json\`: hero, bloques comerciales, categorias y productos destacados.
- \`product-packaging.csv\`: reglas demo de packaging por SKU.
- \`assets/\`: logos e imagenes que se publicaran como \`/images/${id}/...\`.

## Origen

Generado desde \`${from || "template"}\`.

## Activacion

\`\`\`bash
pnpm sync:client-profile
NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id} pnpm --filter @b2b-starter/storefront build
\`\`\`

Para produccion, configura \`NEXT_PUBLIC_B2B_CLIENT_PROFILE=${id}\` en Vercel y \`B2B_CLIENT_PROFILE=${id}\` en Render si quieres sembrar packaging de este perfil.

Consulta \`activation-checklist.md\` para el checklist completo de activacion y QA.
`

  writeTextMaybe(path.join(targetDir, "README.md"), readme, force, dryRun)
  writeTextMaybe(
    path.join(targetDir, "activation-checklist.md"),
    buildActivationChecklist({
      id,
      brandName,
      from,
      country: profile.markets.defaultCountryCode,
      currency: profile.markets.currency,
    }),
    force,
    dryRun
  )
  writeTextMaybe(
    path.join(targetDir, ".env.example"),
    buildEnvExample({ id }),
    force,
    dryRun
  )

  if (sync && !dryRun) {
    const syncResult = spawnSync(process.execPath, ["scripts/sync-client-profile.mjs"], {
      cwd: rootDir,
      stdio: "inherit",
    })

    if (syncResult.status !== 0) {
      throw new Error("Profile created, but sync-client-profile failed")
    }
  } else if (!sync) {
    console.log("Skipped sync-client-profile because --no-sync was provided")
  }

  console.log(`${dryRun ? "Would create" : "Created"} profiles/${id}`)
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
