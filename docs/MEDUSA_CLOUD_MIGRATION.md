# Migracion A Medusa Cloud

Objetivo: mover el backend Medusa desde Render a Medusa Cloud manteniendo el storefront en Vercel y conservando los perfiles B2B.

## Arquitectura objetivo

- Medusa Cloud: backend, Admin, jobs, migraciones y runtime Medusa.
- Vercel: storefront Next.js.
- GitHub: codigo fuente.
- Perfiles: `profiles/<id>` como contrato para marca, home, catalogo y packaging.

## Variables que hay que trasladar

Backend Medusa:

```env
B2B_CLIENT_PROFILE=ngs
STORE_CORS=https://storefront-virid-three-41.vercel.app
ADMIN_CORS=https://<medusa-cloud-admin-url>
AUTH_CORS=https://<medusa-cloud-admin-url>
MEDUSA_BACKEND_URL=https://<medusa-cloud-backend-url>
VITE_STOREFRONT_URL=https://storefront-virid-three-41.vercel.app
MEDUSA_FF_INDEX_ENGINE=false
JWT_SECRET=<generado>
COOKIE_SECRET=<generado>
```

Storefront Vercel:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://<medusa-cloud-backend-url>
NEXT_PUBLIC_B2B_CLIENT_PROFILE=ngs
NEXT_PUBLIC_DEFAULT_REGION=es
```

## Paso 1. Congelar estado actual

```bash
git status --short
pnpm product:demo:check
pnpm product:starter:check
pnpm --filter @b2b-starter/backend build
NEXT_PUBLIC_B2B_CLIENT_PROFILE=ngs pnpm --filter @b2b-starter/storefront build
```

No migrar si la demo actual no pasa build y smoke basico.

## Paso 2. Crear proyecto en Medusa Cloud

Crear proyecto desde el repo actual y seleccionar el paquete backend:

```txt
apps/backend
```

La build debe producir el servidor Medusa igual que ahora hace Render con:

```bash
pnpm --filter @b2b-starter/backend build
```

## Paso 3. Ejecutar migraciones

En el entorno Cloud:

```bash
pnpm medusa db:migrate --execute-safe-links
```

Validar que solo aparecen migraciones reales y scripts oficiales de Medusa. Los seeds utilitarios deben vivir en:

```txt
apps/backend/src/scripts
```

No deben vivir en:

```txt
apps/backend/src/migration-scripts
```

## Paso 4. Sembrar datos demo

Para la demo NGS:

```bash
B2B_CLIENT_PROFILE=ngs pnpm medusa exec ./src/scripts/seed-b2b-demo-data.ts
B2B_CLIENT_PROFILE=ngs pnpm medusa exec ./src/scripts/seed-product-catalog.ts
B2B_CLIENT_PROFILE=ngs pnpm medusa exec ./src/scripts/seed-product-packaging.ts
```

Para una tienda vacia:

```bash
B2B_CLIENT_PROFILE=starter-empty pnpm medusa exec ./src/scripts/seed-product-catalog.ts
B2B_CLIENT_PROFILE=starter-empty pnpm medusa exec ./src/scripts/seed-product-packaging.ts
```

Debe terminar sin errores aunque no haya productos.

## Paso 5. Crear usuario admin

Crear usuario en Cloud desde Admin o CLI:

```bash
pnpm medusa user -e <email> -p <password>
```

Validar login en:

```txt
https://<medusa-cloud-backend-url>/app
```

## Paso 6. Apuntar Vercel a Cloud

Actualizar `NEXT_PUBLIC_MEDUSA_BACKEND_URL` en Vercel y redeploy del storefront.

Validacion minima:

- Home carga.
- Catalogo lista productos.
- PDP abre y muestra packaging.
- Login funciona.
- Carrito no muestra precios sin login.
- Usuario demo aprobado ve precios.
- Presupuestos y accept quote funcionan.
- Admin abre Products, Companies, Quotes, Approvals, Assets, Homepage y Brand Profile.

## Paso 7. Cortar Render

No suspender Render hasta tener:

- Medusa Cloud con `/health` OK.
- Storefront en Vercel apuntando a Cloud.
- Admin probado.
- Flujo comprador probado.
- Backup o export de datos Render si hay datos que conservar.

## Riesgos conocidos

- Render free tarda mucho en arrancar; Cloud deberia mejorar runtime y estabilidad.
- Seeds no deben ejecutarse en cada `start`.
- Si se cambia `B2B_CLIENT_PROFILE`, hay que resembrar catalogo/packaging del perfil correspondiente.
- Los assets de storefront viven en Vercel; los assets subidos desde Admin dependen del file provider configurado.

