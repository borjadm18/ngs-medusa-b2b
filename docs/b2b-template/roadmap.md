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

Estado 2026-07-12: avanzado. `pnpm sync:client-profile` sincroniza perfiles fuente con el storefront, valida `product-packaging.csv` y genera registry backend para seeds. Home, SEO, store, checkout y PDP consumen perfil runtime o fallback empaquetado. Falta extenderlo a productos/categorias completos y eliminar la pagina demo especifica `/ngs-poc` del core.

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
- Pendiente: subida binaria real a storage/CDN, import/export dedicado y plantillas por cliente.

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

## Fase 5. Template Launcher

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

Primer bloque implementado:

```bash
pnpm sync:client-profile
```

Siguiente paso: convertirlo en launcher interactivo que cree la carpeta de perfil, copie assets, valide packaging y prepare envs.

## Fase 6. Vertical Packs

Prioridad: media.

Crear perfiles demo por vertical:

- Electronica/audio profesional.
- Packaging y embalaje.
- Ferreteria industrial.
- Material electrico.
- Repuestos y maquinaria.

Resultado esperado:

- Una libreria de demos adaptables para vender proyectos B2B Medusa.
