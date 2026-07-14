# Template Readiness Checklist

Usar este checklist antes de clonar el template para un cliente nuevo.

## Backend

- [ ] `pnpm --filter @b2b-starter/backend build` pasa.
- [ ] Migraciones ejecutan sin errores.
- [ ] Product packaging module instalado.
- [ ] Homepage content module instalado.
- [ ] Admin user creado.
- [ ] Publishable API key creada.
- [ ] Store/Admin/Auth CORS configurados.

## Storefront

- [ ] `pnpm --filter @b2b-starter/storefront build` pasa.
- [ ] Home no contiene texto hardcodeado del cliente anterior.
- [ ] Logo, colores y footer salen del perfil.
- [ ] Catalogo y PDP usan datos Medusa reales.
- [ ] Carrito muestra packaging/logistica.
- [ ] Checkout bloquea cantidades invalidas.

## Data

- [ ] Categorias importadas.
- [ ] Productos importados.
- [ ] Variantes con SKU.
- [ ] `product-catalog.csv` validado por `pnpm sync:client-profile`.
- [ ] Imagenes cargadas.
- [ ] Price lists configuradas.
- [ ] Packaging CSV importado.
- [ ] Empresas y usuarios demo creados.

## Demo

- [ ] Flujo comprador: login, catalogo, PDP, carrito, checkout.
- [ ] Flujo presupuesto: solicitar, ver en cuenta, revisar en admin.
- [ ] Flujo admin: editar packaging y comprobar PDP.
- [ ] Flujo contenido: editar home y comprobar storefront.
- [ ] Deploy backend live.
- [ ] Deploy storefront live.
