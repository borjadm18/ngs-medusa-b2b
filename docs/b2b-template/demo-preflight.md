# Demo preflight

Checklist operativa antes de ensenar el ecommerce B2B industrial.

## Comando rapido sin admin

```bash
pnpm demo:preflight:public
```

Comprueba perfiles de cliente, usuarios demo, presupuestos abiertos, accept quote,
playbook P0 y QA visual con Playwright. Es el comando recomendado cuando solo
queremos saber si la demo publica esta lista.

## Comando completo

```bash
pnpm demo:preflight
```

Comprueba todo lo anterior y tambien homepage CMS, brand profile, asset library,
packaging admin y reglas de catalogo desde el backoffice.

Requiere credenciales admin configuradas:

```bash
$env:ADMIN_EMAIL="admin@..."
$env:ADMIN_PASSWORD="..."
pnpm demo:preflight
```

Si solo se quiere validar el bloque admin:

```bash
pnpm demo:preflight:admin
```

## Reset demo

```bash
pnpm demo:reset
```

Regenera datos B2B demo y deja empresas aprobadas por defecto.

## Puntos manuales

- Abrir storefront: `https://storefront-virid-three-41.vercel.app/es`
- Abrir backend: `https://ngs-medusa-backend.onrender.com/app`
- Validar home, catalogo, PDP, carrito, cuenta, empresa, presupuestos y admin.
- Confirmar que las tarifas privadas solo aparecen con sesion iniciada.
- Confirmar que carrito y presupuesto muestran cajas, unidades, peso, pallet y transportistas.
- Confirmar que CMS Home permite abrir la home publica y no muestra avisos criticos.
- Confirmar que Assets permite buscar, filtrar, detectar duplicados y editar metadatos.
