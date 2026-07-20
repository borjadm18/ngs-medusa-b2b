# Demo preflight

Checklist operativa antes de ensenar el ecommerce B2B industrial.

## Comando unico

```bash
pnpm demo:preflight
```

Comprueba perfiles de cliente, usuarios demo, presupuestos abiertos, homepage CMS,
brand profile, asset library y QA visual con Playwright.

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
