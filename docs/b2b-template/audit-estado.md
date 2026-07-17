# Auditoria De Estado - Medusa B2B Template

Fecha: 2026-07-13

## Resumen Ejecutivo

El proyecto ya no es solo una demo estatica: tiene backend Medusa real, storefront Next.js, Admin extendido y despliegue en Render/Vercel. La capa B2B principal funciona para companias, presupuestos, aprobaciones, packaging por variante, compra por caja/unidad, validacion de carrito, reglas iniciales de catalogo, contenido editable y perfiles cliente reutilizables.

El siguiente salto es cerrar producto template: QA automatizado, storage persistente para assets, simulador de catalogo por cliente/canal/region y seeds/productos demo por vertical. La home, marca, navegacion, footer, SEO, fallbacks y packaging por perfil ya salen de fuentes sincronizables.

## Estado Por Area

| Area                   | Estado                    | Comentario                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend Medusa         | Operativo                 | Render live, health OK, migraciones activas.                                                                                                                                                                                                                              |
| Storefront             | Operativo                 | Vercel live, home/catalogo/PDP/carrito/checkouts funcionales.                                                                                                                                                                                                             |
| Product packaging      | Implementado              | Modulo, API store/admin, seed NGS, validacion carrito y UI en PDP/carrito. HTTP live validado.                                                                                                                                                                            |
| Homepage editable      | Parcial alto              | Modulo backend, store API, fallback JSON y Admin page con editor estructurado existen. Assets page permite registrar rutas, subir imagenes locales y seleccionarlas desde el editor de Home. Falta storage externo persistente.                                             |
| Client profile         | Parcial alto              | Marca/logo/nav/footer/SEO/home/categorias/store/checkout/PDP fallbacks salen de JSON o Brand profile runtime. `pnpm sync:client-profile` empaqueta perfiles y valida packaging CSV. Admin Brand profile existe con formularios por seccion, preview y modo JSON avanzado. |
| Admin B2B              | Parcial alto              | Widget packaging con import/export, bulk basico, copia entre variantes y plantillas rapidas. Admin Home, Brand profile y Assets existen. Falta storage externo de assets y editores por perfil activo.                                                                     |
| Presupuestos           | Integrado B2B             | Flujo existe; storefront exporta CSV/PDF desde carrito y Admin quote detail muestra packaging/logistica con export CSV.                                                                                                                                                  |
| Aprobaciones           | Base heredada + integrado | Existe en cuenta/carrito/checkout; falta validacion UX y casos demo claros.                                                                                                                                                                                               |
| Reglas catalogo/precio | Inicial implementado      | Modulo catalog rules, Admin CRUD/import/export, Store API y aplicacion inicial en storefront. Falta integracion profunda con price lists/pricing core y simulador por cliente/canal/region.                                                                               |
| Multicanal/multiregion | Pendiente estrategico     | Falta modelar canales B2B, distribuidores, instaladores, regiones, monedas, impuestos y surtidos por mercado.                                                                                                                                                              |
| Import/export          | Parcial alto              | Packaging CSV con preview Admin, catalog rules CSV, cart CSV/PDF y Admin quote CSV. Falta import/export dedicado de homepage/brand profile.                                                                                                                               |
| Documentacion template | Avanzada                  | `docs/b2b-template`, `templates`, `profiles/ngs`, `profiles/example-industrial`, launcher y vertical packs.                                                                                                                                                               |

## Funcionalidades Habladas E Implementadas

### Medusa real front + back

Implementado.

- Backend en Render.
- Storefront en Vercel.
- Admin de Medusa accesible desde backend.
- PostgreSQL y Redis en Render.

### POC NGS visual

Implementado parcialmente y desplegado.

- Home NGS.
- Catalogo con productos reales de Medusa.
- PDP B2B.
- Logo corregido a texto por defecto para evitar imagen oscura.

Pendiente:

- Admin packaging validado en navegador con sesion real.
- QA visual adicional de PDP/carrito tras cada deploy.

### Packaging por unidad/caja

Implementado.

- `productPackaging` module.
- Reglas por variante: unidad/caja, minimo, multiplo, unidades/caja, pallet, peso y dimensiones.
- Seed demo NGS.
- PDP muestra selector unidad/caja.
- Carrito muestra cajas, unidades, peso y dimensiones.
- Validacion en add-to-cart bulk y update de cantidad.

Pendiente:

- Tests HTTP automatizados en Jest.
- Mensajes de error localizados.
- Plantillas por categoria.

### Admin packaging

Implementado parcialmente.

- Widget en producto.
- Edicion por variante.
- Aplicar a todas las variantes.
- Copiar regla desde otra variante.
- Plantillas rapidas por tipo/categoria de producto.
- Importar CSV.
- Preview de CSV antes de aplicar.
- Validacion de errores por fila.
- Emparejamiento por `variant_id` o `sku`.
- Exportar CSV.
- Smoke test reproducible `pnpm smoke:admin-packaging` valida login admin, escritura `/admin/product-packaging` y lectura `/store/product-packaging`.

Pendiente:

- QA visual del widget en navegador real.
- Plantillas avanzadas configurables por cliente/categoria.
- Historial de cambios.

### Homepage editable

Parcial.

- Backend module `homepage`.
- Store API `/store/homepage`.
- Storefront consume contenido con fallback desde `client-profile` empaquetado.
- JSON completo disponible en `profiles/ngs/homepage-content.json` y `templates/homepage-content.example.json`.
- Admin page permite editar hero, CTAs, metricas, bandas, bloques comerciales, bloques visuales y operativa B2B sin tocar JSON crudo.

Pendiente:

- Import/export JSON.
- Upload binario local desde Admin implementado. Pendiente storage/CDN persistente.
- Import/export JSON desde Admin.

### Client profile / template

Parcial.

- `profiles/ngs/client-profile.json` como fuente de onboarding.
- `apps/storefront/src/lib/client-profile/profiles/ngs.json` empaquetado para Vercel.
- Storefront consume marca, logo textual, nav, footer, SEO, store, checkout y PDP desde perfil.
- Storefront consume homepage, categorias destacadas, imagenes fallback y copy comercial desde perfil/homepage JSON.
- Fallbacks PDP/productos relacionados y bloques de soporte/beneficios usan `clientProfile.fallbacks` y `clientProfile.productPage`.
- `product-packaging.csv` por perfil se valida y genera JSON/registry para seeds backend.
- Backend module/API `brandProfile` permite editar el perfil de marca desde Admin y servirlo al Store API.
- Storefront nav/footer, home metadata, store, checkout y PDP consumen `retrieveBrandProfile()` con fallback al perfil empaquetado.

Pendiente:

- Perfil activo por env con multiples clientes.
- Subida binaria local desde Admin implementada.
- Storage/CDN persistente para assets subidos.

### Import/export B2B

Parcial.

- CSV packaging.
- CSV carrito.
- CSV catalog rules desde Admin.
- CSV quote desde Admin.
- PDF/print quote desde carrito.
- Ejemplos en `templates`.

Pendiente:

- CSV/JSON homepage.
- CSV/JSON brand profile.
- Export PDF/CSV de quote persistente desde Admin.
- Importadores CLI.

### Reglas de catalogo, precio y canal

Inicial implementado, pendiente de profundizar.

- Modulo `catalogRules`.
- Admin CRUD, filtros, drawer e import/export CSV con preview.
- Store API para reglas activas.
- Aplicacion inicial de visibilidad/precio mostrado en listados y PDP.
- Simulador Admin para comprobar reglas aplicables por producto, variante, cliente, grupo, region, canal, zona y moneda.
- Test HTTP local para creacion, listado y evaluacion de reglas activas por contexto.

Pendiente:

- Descuentos por cliente, compania, grupo, zona, region y canal.
- Price lists demo por segmento/cuenta.
- Visibilidad de productos y categorias por canal o segmento.
- Surtidos por region y mercado.
- Profundizar simulador con preview de surtido/precio final por cuenta real.
- Import/export CSV de reglas comerciales ya existe; falta validacion operativa con ficheros reales de cliente.

Principio:

- Reutilizar primero capacidades core de Medusa: price lists, customer groups, regions, currencies, sales channels y pricing.
- Crear modulo propio solo para reglas industriales no cubiertas por el core, como zona comercial, canal operativo, visibilidad avanzada o descuentos ligados a packaging/pallet.

### Template launcher / vertical packs

Implementado inicial.

- `pnpm template:new`.
- `--from template|ngs|example-industrial`.
- `--vertical audio|packaging|hardware|electrical|spare-parts`.
- Genera `client-profile.json`, `homepage-content.json`, `product-packaging.csv`, `README.md`, `.env.example`, `activation-checklist.md` y `assets/`.
- Vertical packs generan copy, menu, categorias, fallbacks PDP y packaging CSV demo por sector.
- `pnpm sync:client-profile` valida packaging CSV, copia perfiles al storefront y genera registry backend.

Pendiente:

- Modo interactivo con preguntas guiadas.
- Vertical packs con productos/categorias/seeds demo completos.

### OpenWiki

Bloqueado.

- `openwiki` esta instalado.
- La ejecucion no interactiva exige `OPENAI_API_KEY`.
- El flujo seguro de OpenAI Platform fallo por sesion expirada (`token_expired`).

Siguiente accion:

- Iniciar sesion de nuevo en OpenAI Platform desde Codex o ejecutar `openwiki` en terminal interactiva para guardar credenciales.

## Pendientes Principales

### P0 - Estabilidad Y Demo

1. QA visual de home, catalogo, PDP y carrito en desktop/mobile.
2. Corregir cualquier layout roto tras el cambio a `client-profile`.
3. Validar en navegador Admin: editar packaging y comprobar PDP.
4. Crear tests HTTP para packaging en carrito y reglas de catalogo.
5. Revisar cold start Render y evitar despliegues backend por cambios solo de storefront/docs.

### P1 - Convertir En Template Real

1. Eliminar restos NGS hardcodeados en `/ngs-poc` o moverlos a un pack demo aislado.
   - Avanzado: `/ngs-poc` queda protegido para `profiles/ngs`; perfiles genericos no pueden enlazarlo y el launcher lo normaliza a `/store`.
2. Extraer productos/categorias demo completos a perfiles o seeds parametrizables.
   - Avanzado: `profiles/example-industrial` ya incluye `product-catalog.csv` con 8 productos y `product-packaging.csv` alineado por SKU.
3. Ampliar `sync-client-profile` para preparar assets, packaging y seeds de backend.
   - Avanzado: genera registries backend para packaging y catalogo por perfil.
4. Crear `profiles/example-industrial`.
   - Hecho: perfil generico con marca, home, menu, footer, catalogo y packaging demo.
5. Crear guia "nuevo cliente en 60 minutos".
   - Hecho: `docs/b2b-template/nuevo-cliente-60-minutos.md`.

### P2 - Backoffice No Tecnico

1. Admin packaging con plantillas avanzadas configurables por cliente/categoria.
2. Migrar upload local de imagenes a storage persistente/CDN.
3. Selector de perfil activo para editar varios clientes desde el mismo Admin.
4. Import/export JSON para homepage y brand profile.

### P3 - Operacion B2B Avanzada

1. Presupuesto con packaging/logistica completa.
2. Export PDF/CSV de presupuesto.
3. Busqueda por SKU/EAN/atributos tecnicos.
4. Reglas de catalogo/precio por cliente, zona, region y canal.
5. Multicanal y multiregion: sales channels, regions, monedas, impuestos y surtidos.
6. Price lists por segmento/cuenta demo.
7. Integracion ERP/PIM por CSV primero.

### P4 - Producto Template

1. CLI `create-b2b-client`.
2. Vertical packs: audio/electronica, packaging, material electrico, repuestos.
3. Documentacion OpenWiki generada.
4. Tests E2E Playwright.
5. Publicacion como template reusable.

## Riesgos

- Render free tiene cold starts largos y redeploys lentos.
- Algunas rutas Admin dependen de sesion real para QA.
- El storefront mantiene NGS intencionadamente en `profiles/ngs` y en la pagina especifica `/ngs-poc`.
- El perfil NGS esta duplicado como fuente y artefacto generado; hay que evitar editar artefactos generados directamente.
- OpenWiki no puede ejecutarse sin credencial OpenAI disponible.
- La validacion navegador de Admin packaging queda pendiente porque Render rechazo las credenciales dev documentadas.

## Validacion 2026-07-12

- `corepack pnpm --filter @b2b-starter/storefront build`: OK con Node 24 local forzando `engine-strict=false`; Vercel usa Node 22 por `engines`.
- `corepack pnpm --filter @b2b-starter/backend build`: OK.
- HTTP live backend: `/health` OK.
- HTTP live storefront: `/es` y `/es/store` OK.
- HTTP live packaging/carrito:
  - Variante `NGS-WILD-BASH-COMPACT-BLK`.
  - Regla: 6 uds/caja, minimo 6, multiplo 6.
  - Add-to-cart invalido bloqueado.
  - Add-to-cart valido OK.
  - Edicion posterior invalida bloqueada.
  - Edicion posterior valida OK.
- QA visual Playwright local:
  - Home desktop: `output/playwright/home-desktop.png`.
  - Home mobile: `output/playwright/home-mobile.png`.
  - Store desktop: `output/playwright/store-desktop.png`.
  - Consola navegador: 0 errores tras reiniciar dev server.
- Suite Jest unit packaging: OK, 9 tests cubren minimo B2B, multiplos, compra por caja, cantidad cero en updates y fallback por metadata.
- Suite Jest HTTP: `pg-god` instalado y `.medusa` excluido del runner; el arranque queda bloqueado por conexion Postgres local de test (`client password must be a string`) antes de llegar a rutas Medusa.
- Smoke remoto Admin packaging: OK con `pnpm smoke:admin-packaging` contra Render. Valida credenciales admin, API key publicable, upsert admin y lectura store para `NGS-WILD-BASH-COMPACT-BLK`.

## Recomendacion De Siguiente Sprint

1. Crear `.env.test`/Postgres local o CI con credenciales explicitas y convertir los checks live de packaging en Jest HTTP.
2. Validar Admin packaging visualmente en navegador con credenciales reales.
3. Crear simulador Admin para catalog rules por cliente/canal/region.
4. Extender vertical packs con productos/categorias/seeds demo.
5. Migrar Assets a storage externo persistente.

## Auditoria De Robustez 2026-07-17

### P0 Corregido

- Rutas store de empresa tenian autenticacion, pero no comprobaban pertenencia a la empresa concreta.
- `ensureRole` dependia de metadata global `provider_identity.user_metadata.role`, no de la relacion `customer -> employee -> company`.
- `GET/POST/DELETE /store/companies/:id` y rutas de empleados podian quedar demasiado abiertas si un usuario autenticado conocia IDs.
- Se anadio `ensureCompanyMember()` y se endurecio `ensureRole("company_admin")` para validar:
  - customer autenticado;
  - employee enlazado al customer;
  - employee activo;
  - employee perteneciente a `req.params.id`;
  - rol/admin dentro de esa empresa.
- Se cubrieron `DELETE /store/companies/:id` y `DELETE /store/companies/:id/employees/:employeeId`.
- Se alineo el matcher `:employeeId` con la carpeta `[employeeId]` y se dejo fallback defensivo para `employee_id`.
- Se mantuvo el onboarding funcional con un bootstrap acotado: solo permite crear el primer `company_admin` si la empresa no tiene empleados, el `customer_id` coincide con el customer autenticado y el body validado pide rol/admin activo.

### Validacion Ejecutada

- `validate:client-profiles`: OK, con warnings de assets placeholder en perfiles ejemplo/POC.
- `validate:storefront-debug-logs`: OK.
- `@b2b-starter/backend build`: OK tras fix.
- `@b2b-starter/storefront build` con `NEXT_PUBLIC_B2B_CLIENT_PROFILE=starter-empty`: OK.

### Riesgos Pendientes

- `test:unit` no es fiable localmente: el runner de Medusa/Jest invoca pnpm 11 desde el runtime, fuerza comprobaciones de lockfile y puede dejar `node_modules` incompleto. Se restauro con `pnpm install --frozen-lockfile --prod=false`, pero la suite queda pendiente de CI estable.
- `pnpm.overrides` debe mantenerse tambien en `pnpm-workspace.yaml` para compatibilidad con pnpm moderno.
- Quedan 44 warnings de assets faltantes en perfiles no productivos (`example-audio`, `example-industrial`, `poc-packaging-demo`).
- Hay credenciales demo en docs (`admin@test.com` / `supersecret`); aceptable para entorno demo, no para template publico final.
- Quedan `console.log` accidentales en tests/componentes Admin que deben limpiarse antes de producto reusable.

### Siguiente Hardening Recomendado

1. Crear test HTTP especifico que pruebe que un customer de una empresa no puede leer/editar/borrar otra empresa.
2. Preparar `.env.test` y Postgres local/CI para que `test:integration:http` sea obligatorio.
3. Convertir warnings de assets a error solo para perfiles marcados como `productionReady`.
4. Separar credenciales demo de docs publicas y moverlas a `.env.example`/runbooks privados.
5. Anadir smoke remoto para rutas de company ownership cuando haya dos usuarios demo activos.
