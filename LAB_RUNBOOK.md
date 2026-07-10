# Medusa B2B Local Lab Runbook

Fecha: 2026-07-09

## URLs

- Storefront: http://localhost:8000
- NGS POC: http://localhost:8000/es/ngs-poc
- Medusa backend health: http://localhost:9000/health
- Medusa admin: http://localhost:9000/app

## Admin local

- Email: `admin@test.com`
- Password: `supersecret`

## Arrancar infra

```bash
docker compose -f docker-compose.dev.yml up -d
```

## Instalar dependencias

El repo declara `pnpm@9.15.0`. Usar Corepack para evitar incompatibilidades con pnpm 11+.

```bash
corepack pnpm install
```

## Migrar base de datos

```bash
cd apps/backend
corepack pnpm medusa db:migrate
```

## Crear usuario admin

```bash
cd apps/backend
corepack pnpm medusa user -e admin@test.com -p supersecret
```

## Arrancar backend

```bash
cd apps/backend
corepack pnpm dev
```

Nota: el script local `dev` usa `medusa develop --no-lint` porque el starter actual falla lint en relaciones internas `Company/Employee` y `Quote/Message`.

## Arrancar storefront

```bash
cd apps/storefront
corepack pnpm dev
```

## Comprobar servicios

```bash
docker compose -f docker-compose.dev.yml ps
curl http://localhost:9000/health
curl http://localhost:8000
```

## Build backend

```bash
cd apps/backend
corepack pnpm medusa build --no-lint
```

## Estado conocido

- `corepack pnpm medusa build --no-lint` funciona.
- `corepack pnpm build` falla por lint del starter:
  - `@medusajs/link-no-cross-module-relationship` en `company` y `quote`.
- Redis local esta disponible, pero event bus/workflows/locking siguen en modo local/in-memory salvo configuracion explicita de modulos Redis.
- Las skills oficiales de Medusa se copiaron a `C:\Users\novic\.agents\skills`, pero el instalador aviso que PromptScript no soporta instalacion global.
