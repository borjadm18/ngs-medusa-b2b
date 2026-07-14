# Roadmap Para Convertir La Demo En Template

## Fase 1. Ordenar Lo Reusable

Prioridad: muy alta.

- Crear `client-profile` para marca, navegacion, footer y SEO.
- Eliminar textos NGS hardcodeados del storefront.
- Extraer homepage, categorias destacadas, CTA, imagenes fallback y copy comercial a JSON.
- Extraer fallbacks PDP/producto a `clientProfile.fallbacks`.
- Mover reglas demo NGS a seed/profile, no a core.
- Documentar CSVs y datos obligatorios.
- Mantener la demo NGS como `profiles/ngs`.

Resultado esperado:

- El mismo codigo puede renderizar NGS o un cliente nuevo cambiando configuracion empaquetada.

Estado 2026-07-14: avanzado. `pnpm sync:client-profile` sincroniza perfiles fuente con el storefront, valida `product-packaging.csv`, valida `product-catalog.csv` y genera registries backend para seeds. Home, SEO, store, checkout y PDP consumen perfil runtime o fallback empaquetado. `profiles/example-industrial` ya permite activar una demo generica con catalogo y packaging sin depender de NGS. La pagina `/ngs-poc` queda aislada como demo-only para el perfil `ngs` y el validador evita que perfiles genericos la enlacen.

## Fase 2. Backoffice Operativo

Prioridad: alta.

- Admin page para homepage content.
- Admin bulk editor de packaging con:
  - Aplicar a todas las variantes.
  - Copiar desde otra variante.
  - Plantilla por categoria.
  - Import CSV con preview.
  - Export CSV.
- Admin para brand profile.

Resultado esperado:

- Un usuario no tecnico cambia home, logo, menu y packaging.

Estado 2026-07-12:

- Admin page de homepage implementada.
- Editor estructurado para hero, CTAs, metricas, bloques visuales y operativa B2B.
- Admin page de Brand profile implementada con formularios por seccion, preview lateral y modo JSON avanzado.
- Storefront nav/footer, home metadata, store, checkout y PDP leen Brand profile desde Store API con fallback empaquetado.
- Assets page implementada como libreria operativa de URLs/rutas con preview, filtros, copia de ruta y CRUD Admin.
- Selector de assets embebido en los editores de Homepage y Brand profile para elegir hero, bloques visuales y logos sin copiar rutas a mano.

## Foco Inmediato: Ecommerce B2B

Antes de seguir profundizando launcher/deploy multi-cliente, la prioridad vuelve a ser funcionalidad B2B vendible:

- Pedido rapido por SKU/CSV con resumen logistico.
- Presupuesto con packaging, peso, cajas, pallets y export.
- Reglas comerciales por cliente, zona, region y canal.
- Catalogo privado y visibilidad por cuenta.
- Price lists reales conectadas con core Medusa.
- Flujos de empresa: roles, limites, aprobaciones y compradores.
- Busqueda por SKU/EAN/atributos tecnicos.

Estado 2026-07-14: `Quick order` ya resuelve SKUs, valida packaging y anade en bulk al carrito. Se anade resumen operativo de unidades, cajas, peso estimado y ocupacion de pallet para acercarlo a una herramienta real de compras B2B. El detalle de presupuesto tambien muestra logistica B2B visible y mantiene export CSV/PDF con packaging.
- Las reglas `requires_quote` ya cambian el comportamiento de PDP: la compra directa pasa a CTA de presupuesto, con copy comercial especifico y sin CTA duplicado.
- Upload binario local desde Admin implementado y servido por backend para demos.
- Admin packaging permite aplicar a todas, copiar desde otra variante, usar plantillas rapidas, importar CSV con preview y exportar CSV.
- Pendiente: storage/CDN persistente, import/export dedicado y plantillas por cliente.

## Fase 3. Validacion B2B Robusta

Prioridad: alta.

- Tests HTTP para:
  - Add-to-cart bulk.
  - Update cart line item.
  - Checkout con cantidades invalidas.
  - Packaging inexistente.
  - Packaging editado en admin.
- Mensajes de error por idioma.
- Fallbacks visibles en UI.

Resultado esperado:

- El template no permite pedidos B2B invalidos.

Estado 2026-07-12: validado contra backend live. Unit tests de packaging disponibles. Pendiente convertir checks live a Jest HTTP cuando exista un Postgres de test local/CI con credenciales explicitas.

Actualizacion 2026-07-12:

- `pg-god` instalado.
- Unit tests de packaging anadidos y pasando.
- Smoke remoto `pnpm smoke:admin-packaging` anadido para validar Admin -> Store packaging contra un backend desplegado.
- Build backend pasando.
- HTTP Jest pendiente por entorno Postgres de test: falta `.env.test`/CI con password explicita.

## Fase 4. Import/Export Profesional

Prioridad: media-alta.

- CSV packaging.
- CSV home content.
- CSV/JSON brand profile.
- Export de presupuesto con packaging/logistica.
- Validacion de columnas y reporte de errores.

Resultado esperado:

- Operaciones puede alimentar la demo desde Excel.

## Fase 5. Reglas De Catalogo, Multicanal Y Multirregion

Prioridad: alta.

- Reglas de catalogo por cliente, compania, zona, region y canal.
- Descuentos por:
  - cliente o compania.
  - segmento comercial.
  - zona geografica.
  - canal B2B, distribuidor, instalador, retail o marketplace.
  - volumen, caja, pallet o recurrencia.
- Price lists demo por segmento/cuenta usando capacidades core de Medusa siempre que sea posible.
- Visibilidad de catalogo por canal:
  - productos visibles/ocultos por cliente o segmento.
  - categorias diferentes por canal.
  - surtidos por region.
- Multiregion:
  - regiones, monedas, impuestos y paises soportados.
  - disponibilidad y reglas logisticas por region.
  - copy y condiciones comerciales por mercado.
- Multicanal:
  - storefront B2B directo.
  - portal distribuidores.
  - canal instaladores/proyectos.
  - posible marketplace o integracion ERP/PIM.
- Admin para gestionar o importar reglas:
  - CSV reglas catalogo/precio.
  - preview y validacion por fila.
  - simulador "ver catalogo como cliente/canal/region".

Resultado esperado:

- El template puede demostrar escenarios B2B reales donde un cliente ve precios, surtido y condiciones distintos segun quien es, donde compra y por que canal entra.

Estado 2026-07-13:

- Modulo backend `catalogRules` creado.
- Admin API inicial: `GET/POST /admin/catalog-rules`, `GET/DELETE /admin/catalog-rules/:id`.
- Store API inicial: `GET /store/catalog-rules` devuelve reglas activas aplicables a producto/variante/categoria/coleccion + compania/grupo/region/canal/zona/moneda.
- Admin UI inicial `Catalog rules` con listado, filtros y drawer para crear/editar/eliminar reglas.
- Import/export CSV desde Admin con preview, validacion por fila y endpoint bulk.
- Storefront lee reglas activas y aplica visibilidad/precio mostrado en listados y PDP.
- Migracion `catalog_rule` generada con indices para estado, target, compania, grupo, region y canal.
- Smoke remoto `pnpm smoke:catalog-rules` preparado.
- Simulador Admin implementado para evaluar reglas por producto, variante, compania, grupo, region, canal, zona y moneda.
- Test HTTP local anadido para creacion/listado y evaluacion de reglas aplicables por contexto B2B.

Pendiente:

- Aplicar reglas de precio contra price lists/pricing core de Medusa.
- Profundizar visibilidad/surtidos con preview de catalogo final por cuenta real.
- Validar tests HTTP en entorno con PostgreSQL local de test configurado.

Notas de arquitectura:

- Reutilizar price lists, regions, customer groups, sales channels y pricing core de Medusa cuando cubran el caso.
- Crear modulo propio solo para reglas industriales que Medusa no cubra de forma nativa, como visibilidad avanzada, zona comercial, canal operativo o descuentos ligados a packaging/pallet.

## Fase 6. Template Launcher

Prioridad: media.

Crear script o CLI:

```bash
pnpm create-b2b-client --profile ./profiles/ngs/client-profile.json
```

Debe:

- Copiar assets.
- Validar perfil.
- Importar homepage.
- Importar packaging.
- Configurar envs.
- Generar checklist de deploy.

Resultado esperado:

- Crear una demo nueva en horas, no dias.

Estado 2026-07-13:

```bash
pnpm sync:client-profile
pnpm template:new -- --id acme-industrial --name "ACME Industrial" --from example-industrial
```

- `sync:client-profile` empaqueta perfiles para storefront y backend.
- `template:new` crea `profiles/<cliente>` desde `templates` o desde un perfil existente.
- Soporta `--from`, `--accent`, `--tagline`, `--country`, `--currency`, `--dry-run`, `--no-sync` y `--force`.
- Soporta vertical packs con `--vertical audio|packaging|hardware|electrical|spare-parts`, incluyendo copy, menu, categorias, fallbacks PDP y packaging CSV demo.
- Copia packaging CSV, assets si existen, genera README por cliente y ejecuta sync por defecto.

Siguiente paso: convertirlo en launcher interactivo con preguntas guiadas y vertical packs con productos/packaging demo por sector.

## Fase 7. Vertical Packs

Prioridad: media.

Crear perfiles demo por vertical:

- Electronica/audio profesional.
- Packaging y embalaje.
- Ferreteria industrial.
- Material electrico.
- Repuestos y maquinaria.

Resultado esperado:

- Una libreria de demos adaptables para vender proyectos B2B Medusa.
