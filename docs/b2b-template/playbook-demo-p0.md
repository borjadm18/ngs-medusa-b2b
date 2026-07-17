# Playbook Demo P0

Este checklist valida que la demo B2B principal puede defender el guion antes de una reunion interna o externa.

## Comando

```bash
corepack pnpm@9.15.0 product:demo:check
```

El comando ejecuta:

1. Validacion del perfil cliente `ngs`.
2. Smoke de usuarios demo y presupuestos.
3. Smoke P0 contra Render/Vercel.

## Cobertura Actual

El smoke P0 comprueba:

- Backend Render `/health`.
- Home y catalogo publico accesibles.
- Catalogo y PDP anonimos sin precios visibles.
- Tres usuarios demo con login valido.
- Empresas demo aprobadas.
- CIF, condiciones de pago y metodos de pago demo.
- Rutas de cuenta B2B: resumen, empresa, pedidos, presupuestos, pedido rapido, aprobaciones, direcciones y perfil.
- Detalle y preview de presupuestos.
- Al menos un presupuesto `pending_customer` para aceptar.
- Al menos un presupuesto `pending_merchant` para mostrar revision comercial.
- Presupuestos aceptados historicos.
- Pedidos historicos para reorder.
- Pedido rapido por SKU con tres referencias NGS.

## Admin Opcional

Si el entorno incluye `ADMIN_PASSWORD` o `NGS_ADMIN_PASSWORD`, `smoke:playbook-p0` valida tambien:

- Login admin.
- Resumen `B2B Control`.
- Empresas visibles en Admin.
- Presupuestos visibles en Admin.
- Reglas de catalogo visibles en Admin.

Ejemplo:

```bash
$env:ADMIN_PASSWORD="..."
corepack pnpm@9.15.0 smoke:playbook-p0
```

## GitHub Actions

El workflow `B2B Quality Gate` incluye un job manual llamado `Remote demo playbook smoke`.

Uso recomendado antes de una demo:

1. Abrir GitHub Actions.
2. Ejecutar manualmente `B2B Quality Gate` con `workflow_dispatch`.
3. Revisar el job `Remote demo playbook smoke`.

Para cubrir tambien Admin en CI, configurar el secreto:

```text
NGS_ADMIN_PASSWORD
```

Si el secreto no existe, el smoke valida storefront/demo publica y omite Admin.

## QA Visual

Para revisar el recorrido visual con capturas:

```bash
corepack pnpm@9.15.0 qa:playbook-visual
```

Por defecto valida produccion. Para validar el storefront local:

```bash
$env:STOREFRONT_SMOKE_URL="http://localhost:8000"
corepack pnpm@9.15.0 qa:playbook-visual
```

El reporte queda en:

```text
output/playwright/playbook-p0/report.json
```

Tambien se guardan capturas desktop/mobile de home, catalogo, PDP, cuenta, empresa, pedidos, presupuestos, pedido rapido y detalle de presupuesto.

## Estado De La Ultima Validacion

Fecha: 2026-07-17.

Resultado contra produccion:

- Backend: `https://ngs-medusa-backend.onrender.com`
- Storefront: `https://storefront-virid-three-41.vercel.app`
- Resultado: 0 fallos, 0 avisos, 53 OK.
- Datos demo: 3 usuarios validados, 1 presupuesto pendiente de cliente, 1 pendiente de ventas, 3 aceptados y 3 pedidos historicos/reorder.
- `accept quote` validado con aceptacion real controlada: `quo_01KXJSJQBV0V5F122H0NK0KAJH`.
- Resultado con Admin incluido: 0 fallos, 0 avisos, 58 OK.
- Admin validado: login, B2B Control con 7 empresas / 7 presupuestos, listado de empresas, listado de presupuestos y 16 reglas de catalogo.

QA visual local tras ajustes de header/logo/carrusel:

- Storefront: `http://localhost:8000`
- Resultado: 16 paginas, sin issues visuales detectados.

Nota: los previews de Vercel pueden estar protegidos por login del workspace. `qa:playbook-visual` detecta esa pantalla como fallo para evitar falsos positivos. Para validar una demo publica, usar la URL de produccion o una preview con bypass/desproteccion configurada.

## Pendiente Fuera Del Smoke

- Prueba visual manual o Playwright de la narrativa completa.
- Aceptar una quote real solo cuando se quiera consumir un escenario demo.
- Validar Admin con credenciales reales antes de una demo externa.
