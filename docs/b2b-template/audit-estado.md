# Auditoria De Estado - Medusa B2B Template

Fecha: 2026-07-12

## Resumen Ejecutivo

El proyecto ya no es solo una demo estatica: tiene backend Medusa real, storefront Next.js, Admin extendido y despliegue en Render/Vercel. La capa B2B principal funciona para companias, presupuestos, aprobaciones, packaging por variante, compra por caja/unidad, validacion de carrito y contenido de homepage desde backend.

El siguiente salto es cerrar el backoffice no tecnico. La home, marca, navegacion, footer, SEO y fallbacks principales ya salen de JSON empaquetado; queda evitar duplicacion entre `profiles/*` y `apps/storefront/src/lib/client-profile/profiles/*`, y crear editores Admin para que no haya que tocar codigo.

## Estado Por Area

| Area                   | Estado                    | Comentario                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend Medusa         | Operativo                 | Render live, health OK, migraciones activas.                                                                                                                                                                                                                              |
| Storefront             | Operativo                 | Vercel live, home/catalogo/PDP/carrito/checkouts funcionales.                                                                                                                                                                                                             |
| Product packaging      | Implementado              | Modulo, API store/admin, seed NGS, validacion carrito y UI en PDP/carrito. HTTP live validado.                                                                                                                                                                            |
| Homepage editable      | Parcial alto              | Modulo backend, store API, fallback JSON y Admin page con editor estructurado existen. Assets page permite registrar/copiar rutas visuales; falta upload binario real.                                                                                                    |
| Client profile         | Parcial alto              | Marca/logo/nav/footer/SEO/home/categorias/store/checkout/PDP fallbacks salen de JSON o Brand profile runtime. `pnpm sync:client-profile` empaqueta perfiles y valida packaging CSV. Admin Brand profile existe con formularios por seccion, preview y modo JSON avanzado. |
| Admin B2B              | Parcial                   | Widget packaging con import/export y bulk basico. Falta UX avanzada y admin homepage/brand.                                                                                                                                                                               |
| Presupuestos           | Base heredada + integrado | Flujo existe; falta enriquecer presupuesto con packaging/logistica completa.                                                                                                                                                                                              |
| Aprobaciones           | Base heredada + integrado | Existe en cuenta/carrito/checkout; falta validacion UX y casos demo claros.                                                                                                                                                                                               |
| Import/export          | Parcial                   | Packaging CSV y cart CSV. Falta import/export homepage, brand profile y presupuesto.                                                                                                                                                                                      |
| Documentacion template | Iniciada                  | `docs/b2b-template`, `templates`, `profiles/ngs`.                                                                                                                                                                                                                         |

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
- Importar CSV.
- Exportar CSV.
- Smoke test reproducible `pnpm smoke:admin-packaging` valida login admin, escritura `/admin/product-packaging` y lectura `/store/product-packaging`.

Pendiente:

- QA visual del widget en navegador real.
- Preview antes de importar.
- Validacion de errores por fila.
- Copiar desde otra variante.
- Plantilla por categoria.
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
- Gestion de assets desde admin o storage.

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
- Subida binaria real de assets a storage/CDN y selector embebido dentro de Home/Brand Profile.
- Gestion de assets desde Admin/storage.

### Import/export B2B

Parcial.

- CSV packaging.
- CSV carrito.
- Ejemplos en `templates`.

Pendiente:

- CSV/JSON homepage.
- CSV/JSON brand profile.
- Export de presupuesto con packaging/logistica.
- Importadores CLI.

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
4. Crear tests HTTP para packaging en carrito.
5. Revisar cold start Render y evitar despliegues backend por cambios solo de storefront/docs.

### P1 - Convertir En Template Real

1. Extraer homepage completa a `client-profile` o `homepage-content`.
2. Extraer copy PDP/catalogo/footer restante.
3. Script `sync-client-profile` para empaquetar perfiles en storefront.
4. Crear `profiles/example-industrial`.
5. Crear guia "nuevo cliente en 60 minutos".

### P2 - Backoffice No Tecnico

1. Admin page para editar homepage.
2. Admin page para editar brand profile.
3. Admin packaging con preview CSV, errores por fila y plantillas.
4. Gestion de imagenes: local al principio, storage despues.

### P3 - Operacion B2B Avanzada

1. Presupuesto con packaging/logistica completa.
2. Export PDF/CSV de presupuesto.
3. Busqueda por SKU/EAN/atributos tecnicos.
4. Price lists por segmento/cuenta demo.
5. Integracion ERP/PIM por CSV primero.

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
- El perfil NGS esta duplicado en raiz y storefront hasta crear sincronizacion.
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
3. Crear Admin brand/profile editor.
4. Extender `sync:client-profile` para importar packaging/seed backend.
5. Empezar presupuesto enriquecido con packaging/logistica y export.
