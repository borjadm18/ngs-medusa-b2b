# Runbook Operativo - Medusa B2B Industrial

Este runbook separa los tres usos del repo para evitar mezclar demo comercial, starter limpio y POCs por cliente.

## 1. Demo comercial publica

Uso: ensenar el valor del ecommerce B2B industrial con una demo viva.

- Perfil: `ngs`
- Storefront: `https://storefront-virid-three-41.vercel.app/es`
- Backend/Admin: `https://ngs-medusa-backend.onrender.com/app`
- Entorno storefront: `NEXT_PUBLIC_B2B_CLIENT_PROFILE=ngs`
- Entorno backend: `B2B_CLIENT_PROFILE=ngs`

Validacion:

```bash
pnpm product:demo:check
pnpm smoke:demo-readiness
```

No usar este perfil como base limpia de clientes reales. Puede tener narrativa, productos y datos preparados para vender la vision.

## 2. Starter limpio para nuevos proyectos

Uso: arrancar una tienda B2B industrial sin datos de cliente.

- Perfil: `starter-empty`
- Catalogo: vacio
- Packaging: vacio
- Assets: placeholders neutros

Validacion:

```bash
pnpm product:starter:check
NEXT_PUBLIC_B2B_CLIENT_PROFILE=starter-empty pnpm --filter @b2b-starter/storefront build
pnpm --filter @b2b-starter/backend build
```

Activacion:

```env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=starter-empty
B2B_CLIENT_PROFILE=starter-empty
```

Este es el punto de partida para proyectos reales cuando todavia no hay marca, catalogo ni assets.

## 3. POC por cliente

Uso: preparar una demo adaptada a un prospect en pocas horas.

Ejemplo validado:

- Perfil: `poc-packaging-demo`
- Vertical: `packaging`
- Catalogo demo: 5 productos
- Packaging demo: cajas, minimos, multiplos, pallets, peso y dimensiones

Crear un nuevo POC:

```bash
pnpm product:poc:new -- --id acme-industrial --name "ACME Industrial" --vertical industrial --accent "#d71920"
```

Verticales disponibles:

- `industrial`
- `audio`
- `packaging`
- `hardware`
- `electrical`
- `spare-parts`

Validar POC:

```bash
pnpm validate:client-profiles -- --id acme-industrial
pnpm sync:client-profile
NEXT_PUBLIC_B2B_CLIENT_PROFILE=acme-industrial pnpm --filter @b2b-starter/storefront build
```

Sembrar backend con datos del perfil:

```bash
B2B_CLIENT_PROFILE=acme-industrial pnpm seed:product-catalog
B2B_CLIENT_PROFILE=acme-industrial pnpm seed:product-packaging
```

## Regla de oro

- La demo vende.
- El starter acelera delivery.
- El POC adapta la demo a un cliente concreto.

Si un cambio mejora el framework, debe funcionar con `starter-empty`.
Si un cambio mejora la venta, debe poder vivir en `ngs`.
Si un cambio es especifico de un prospect, debe vivir en `profiles/<cliente>`.

## Deploy actual

Arquitectura actual:

- GitHub: repo fuente.
- Render: backend Medusa, base de datos y Redis.
- Vercel: storefront Next.js.

Cuando se migre a Medusa Cloud:

- Mantener Vercel para storefront salvo decision contraria.
- Mover backend Medusa desde Render a Medusa Cloud.
- Replicar variables `B2B_CLIENT_PROFILE`, CORS, auth secrets, database/redis gestionados por Cloud.
- Ejecutar migraciones y seeds desde el entorno Cloud.
- Validar Admin, Store API, login, PDP, carrito y presupuestos antes de cortar Render.

## Checklist antes de demo externa

- Backend responde `/health`.
- Storefront carga home, catalogo, PDP, carrito y cuenta.
- Usuario demo aprobado.
- Productos visibles en backoffice y front.
- Precios privados ocultos sin login.
- Packaging visible en PDP y carrito.
- Accept quote probado.
- Admin puede editar logo, menu, home, assets, packaging y aprobaciones.
