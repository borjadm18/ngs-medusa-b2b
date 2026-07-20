# MVP Sustitutos, Recambios Y Equivalencias

Objetivo: convertir conocimiento tecnico/comercial en recomendaciones accionables dentro del ecommerce B2B industrial.

## Alcance MVP

La primera version debe demostrar cuatro capacidades:

1. Un producto puede tener sustitutos, recambios, alternativas o upgrades.
2. El comprador puede descubrirlos desde PDP, PLP y busqueda.
3. El comercial/admin puede gestionarlos sin tocar codigo.
4. La informacion puede importarse desde CSV.

Queda fuera del MVP:

- Reemplazo automatico de lineas de carrito sin confirmacion.
- Motor semantico/IA de compatibilidad.
- Integracion con PIM/ERP real.

## Modelo Medusa

Modulo recomendado: `productReplacements`.

Modelo: `product_replacement`.

Campos:

- `id`
- `source_product_id`
- `source_variant_id`
- `source_sku`
- `source_alias`
- `replacement_product_id`
- `replacement_variant_id`
- `replacement_sku`
- `relation_type`: `replacement`, `spare_part`, `compatible`, `upgrade`, `alternative`
- `compatibility`: `exact`, `partial`, `requires_validation`
- `reason`
- `priority`
- `status`: `active`, `draft`, `archived`
- `company_id`
- `customer_group_id`
- `region_id`
- `sales_channel_id`
- `notes`

Regla: mantener IDs y SKUs. Los SKUs permiten importar desde Excel; los IDs permiten resolver relaciones internas con precision.

## Workflows

Mutaciones siempre por workflow:

- `upsertProductReplacementWorkflow`
  - valida origen y destino
  - normaliza SKUs
  - evita source = replacement
  - crea o actualiza equivalencia
- `deleteProductReplacementWorkflow`
  - soft delete o archived
- `importProductReplacementsWorkflow`
  - procesa CSV
  - valida filas
  - devuelve preview/error report

## Admin API

Rutas:

- `GET /admin/product-replacements`
  - filtros: source_sku, replacement_sku, relation_type, compatibility, status, company_id, region_id, sales_channel_id
- `POST /admin/product-replacements`
  - crea/actualiza una relacion
- `DELETE /admin/product-replacements/:id`
  - archiva/elimina
- `POST /admin/product-replacements/import`
  - import CSV con preview y apply
- `GET /admin/product-replacements/export`
  - export CSV

Todas las rutas con Zod validators y SDK en Admin UI.

## Store API

Rutas:

- `GET /store/product-replacements`
  - filtros: product_id, variant_id, sku, q, region_id, sales_channel_id
  - contexto futuro: company_id/customer_group desde customer autenticado
- `GET /store/product-replacements/search`
  - busca por SKU antiguo, alias, EAN/MPN si estan en metadata/producto

Respuesta recomendada:

```json
{
  "source": {
    "sku": "OLD-SKU"
  },
  "replacements": [
    {
      "relation_type": "replacement",
      "compatibility": "partial",
      "reason": "sin stock",
      "priority": 10,
      "notes": "Alternativa con mas potencia",
      "product": {},
      "variant": {}
    }
  ]
}
```

## Admin UI

Rutas/widgets:

- Nueva ruta `Product replacements`.
- Widget en pagina de producto: `Sustitutos y recambios`.
- Drawer para crear relacion:
  - buscar producto origen
  - buscar producto destino
  - tipo
  - compatibilidad
  - prioridad
  - contexto B2B opcional
  - notas
- Import/export CSV usando `templates/product-replacements.example.csv`.

UX:

- Tabla densa, no cards grandes.
- Badges para tipo/compatibilidad/status.
- Acciones: editar, desactivar, duplicar, exportar.

## Storefront

PDP:

- Bloque compacto debajo de configuracion de pedido o especificaciones.
- Titulo: `Sustitutos y recambios compatibles`.
- Mostrar maximo 3 recomendaciones.
- CTA: `Ver alternativa`, `Solicitar validacion` si compatibilidad no es exacta.

PLP:

- Badge discreto: `Sustituto disponible`.
- No sobrecargar la card.

Busqueda:

- Si no hay resultado exacto, mostrar:
  - `No encontramos esa referencia, pero hay alternativas compatibles`.
- Buscar por:
  - SKU actual
  - SKU antiguo
  - alias
  - EAN/GTIN/MPN/barcode si existe en metadata

Carrito/quote:

- Si una linea tiene stock cero, descatalogado o requiere presupuesto:
  - sugerir sustituto
  - no sustituir automaticamente

## Demo Data

Fuente inicial:

- `templates/product-replacements.example.csv`

Casos demo:

- Sin stock -> alternativa disponible.
- Color alternativo exacto.
- Recambio compatible.
- Upgrade premium.
- Requiere validacion tecnica.

## Tests Y Smokes

P0:

- Unit: validacion de relacion source/destination.
- HTTP admin: crear/listar/desactivar.
- HTTP store: resolver sustitutos por SKU.
- Storefront smoke: PDP muestra bloque cuando hay equivalencias.

P1:

- Import CSV con preview.
- Busqueda por alias/SKU antiguo.
- Contexto por company/region/canal.

## Criterio De Exito

La feature esta lista para demo cuando:

- Un admin puede crear una equivalencia desde backoffice.
- Una PDP muestra sustitutos reales.
- Buscar una referencia antigua devuelve alternativas.
- El CSV permite cargar al menos 5 relaciones demo.
- El preflight valida una relacion end-to-end.
