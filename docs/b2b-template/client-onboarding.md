# Client Onboarding Checklist

Este checklist convierte un cliente B2B nuevo en una demo funcional sobre el template.

## 1. Identidad

Datos necesarios:

- Nombre comercial.
- Logo en claro y oscuro.
- Colores primario, acento, fondo, texto, borde.
- Tipografia preferida o fallback.
- Tono: industrial, tecnico, premium, distribucion, servicio, etc.
- Idiomas y mercados iniciales.

Entregable:

- `templates/client-profile.example.json` adaptado al cliente.
- Assets en `profiles/<cliente>/assets`.
- `pnpm sync:client-profile` para empaquetar el perfil en el storefront.

## 2. Catalogo

Datos necesarios:

- Familias/categorias.
- Productos principales para demo.
- Variantes y SKUs.
- Imagen principal y galeria.
- Fichas tecnicas, manuales, certificados.
- Atributos tecnicos por categoria.

Entregable:

- Seed de productos o importacion desde ERP/PIM.
- Taxonomia para menu, PLP y PDP.

## 3. Packaging B2B

Datos necesarios por SKU:

- Unidad de venta: `unit` o `box`.
- Unidades por caja.
- Pedido minimo.
- Multiplo de compra.
- Cajas por pallet.
- Peso por caja.
- Dimensiones por caja.

Entregable:

- CSV compatible con `templates/product-packaging.example.csv`.
- Validacion en PDP, carrito y checkout.
- `pnpm sync:client-profile` valida `profiles/<cliente>/product-packaging.csv` y genera artefactos backend para seed/import.

## 4. Pricing Y Condiciones Comerciales

Datos necesarios:

- PVP o tarifa base.
- Precio B2B.
- Descuentos por volumen.
- Precio por cuenta/segmento si aplica.
- Monedas y regiones.
- IVA incluido/excluido.

Entregable:

- Price lists en Medusa.
- Reglas visibles en PDP y presupuesto.

## 5. Operativa B2B

Datos necesarios:

- Tipos de cliente: distribuidor, instalador, gran cuenta, retail, etc.
- Roles: comprador, aprobador, admin empresa, comercial interno.
- Limites de gasto.
- Flujo de aprobacion.
- Flujo de presupuesto.

Entregable:

- Empresas y usuarios demo.
- Casos de prueba end-to-end.

## 6. Contenido

Datos necesarios:

- Hero.
- Categorias destacadas.
- Soluciones/sectores.
- Productos destacados.
- Bloques de confianza.
- Footer.
- CTA comercial.

Entregable:

- JSON compatible con `templates/homepage-content.example.json`.
- Edicion desde admin cuando el modulo este completo.
- Fallback empaquetado con `pnpm sync:client-profile`.

## 7. Validacion De Demo

Checklist minimo:

- Home carga en desktop y mobile.
- Catalogo lista productos con imagen.
- PDP permite seleccionar variante y unidad/caja.
- Carrito bloquea cantidades invalidas.
- Presupuesto muestra packaging y totales.
- Admin edita packaging y se refleja en PDP.
- Import/export CSV funciona con datos reales.
- Deploy estable en Vercel + Render.

## 8. Activacion Tecnica Del Perfil

Pasos:

1. Crear carpeta `profiles/<cliente>`.
2. Anadir `client-profile.json`, `homepage-content.json` y, si aplica, `product-packaging.csv`.
3. Anadir assets en `profiles/<cliente>/assets`.
4. Ejecutar:

```bash
pnpm sync:client-profile
```

5. Activar en el storefront:

```env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=<cliente>
```

6. Validar:

```bash
pnpm --filter @b2b-starter/storefront build
```

El objetivo es que una demo nueva no requiera editar componentes React para cambiar marca, home, menu, footer o fallbacks de producto.

Si el perfil incluye `product-packaging.csv`, el sync tambien genera:

```txt
apps/backend/src/migration-scripts/generated-client-profiles/<cliente>-product-packaging.json
apps/backend/src/migration-scripts/generated-client-profiles/product-packaging-registry.ts
```

El seed `seed-product-packaging.ts` usa `B2B_CLIENT_PROFILE` o `NEXT_PUBLIC_B2B_CLIENT_PROFILE` para escoger las reglas activas.
