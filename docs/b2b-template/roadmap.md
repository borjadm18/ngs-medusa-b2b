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

Estado 2026-07-12: avanzado. Falta script de sincronizacion para no duplicar perfiles.

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

Estado 2026-07-12: validado contra backend live. Pendiente convertir a Jest porque el runner local esta bloqueado por `pg-god`.

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
