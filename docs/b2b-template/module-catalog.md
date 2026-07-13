# Module Catalog

Catalogo de capacidades que debe ofrecer el framework B2B.

## Core B2B

Fuente base: `medusajs/b2b-starter-medusa`.

Modulos registrados en `apps/backend/medusa-config.ts`:

- `company`
- `approval`
- `quote`
- `productPackaging`
- `homepage`
- `brandProfile`
- `assetLibrary`
- `catalogRules`
- `Modules.CACHE`
- `Modules.WORKFLOW_ENGINE`

### Companies

Gestion de empresas, empleados, roles y permisos.

Estado: heredado del starter B2B e importado en backend.

### Approvals

Flujos de aprobacion para pedidos que superan reglas de empresa o usuario.

Estado: heredado del starter B2B.

### Quotes

Solicitud y negociacion de presupuestos.

Estado: heredado del starter B2B, con oportunidades de mejora en packaging.

## Industrial Commerce

### Product Packaging

Reglas por variante:

- `sales_unit`
- `minimum_order_quantity`
- `quantity_increment`
- `units_per_box`
- `boxes_per_pallet`
- `package_weight`
- `package_dimensions`

Estado: implementado.

Siguiente mejora:

- Plantillas por categoria.
- Copiar reglas desde otra variante.
- Import CSV con preview y validacion.
- Historial de cambios.

### Bulk Cart Validation

Validacion de reglas B2B en:

- Add-to-cart bulk.
- Edicion de cantidad en carrito.
- Checkout.

Estado: implementado.

Siguiente mejora:

- Errores localizados en castellano/ingles.
- Mensajes accionables en UI.
- Tests HTTP.

### Cart And Quote Logistics

Mostrar la implicacion logistica de la seleccion:

- Cajas.
- Unidades totales.
- Peso estimado.
- Dimensiones.
- Pallet share.

Estado: implementado en carrito, pendiente profundizar en presupuesto.

### Catalog Rules

Reglas comerciales por contexto B2B:

- cliente/compania.
- customer group.
- region.
- sales channel.
- zona comercial.
- moneda.
- producto, variante, categoria, coleccion o todo el catalogo.
- descuento porcentual, precio fijo, ocultacion, surtido exclusivo o requiere presupuesto.

Estado: base backend implementada.

Incluye:

- modulo `catalogRules`.
- tabla `catalog_rule`.
- Admin API para crear/listar/eliminar reglas.
- Admin UI inicial `Catalog rules` con listado, filtros y drawer de creacion/edicion.
- Store API para evaluar reglas activas aplicables a un contexto.
- smoke remoto `pnpm smoke:catalog-rules`.

Siguiente mejora:

- import/export CSV con preview.
- integracion real con price lists/pricing de Medusa cuando sea descuento/precio.
- integracion con catalogo/storefront para ocultar o priorizar surtidos.
- simulador "ver catalogo como cliente/canal/region".

## Content Operations

### Homepage Content

Contenido editable para home:

- Hero.
- Categorias.
- Productos destacados.
- Bloques comerciales.
- CTA.

Estado: modulo backend implementado, pendiente admin robusto y client profiles.

### Brand Profile

Configuracion de marca:

- Logo.
- Colores.
- Copy base.
- Navegacion.
- Footer.
- SEO.

Estado: pendiente.

## Integrations

### ERP/PIM Adapter

Importacion de productos, stock, precio y packaging desde sistemas externos.

Estado: pendiente.

Primer objetivo:

- CSV estable.
- Luego API connector por cliente.

### Search

Busqueda B2B por:

- SKU.
- EAN.
- Nombre.
- Categoria.
- Atributos tecnicos.

Estado: pendiente.

## Template Operations

### Client Profile

Un JSON unico para levantar marca/demo.

Estado: scaffold creado en `templates/client-profile.example.json`.

### Demo Seeds

Seeds por vertical:

- Audio/electronica.
- Packaging y embalaje.
- Repuestos.
- Material electrico.
- Suministro industrial.

Estado: pendiente.
