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
- Assets en `apps/storefront/public/images/client/...`.

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
