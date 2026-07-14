# Medusa B2B Commerce Template

Este repositorio debe evolucionar de POC NGS a un template reusable para ecommerce B2B industrial sobre Medusa. La idea no es crear otra demo estatica, sino un acelerador con opinion de producto: backend real, storefront real, admin real y datos operativos importables.

## Objetivo

Crear una base repetible para clientes B2B que necesitan:

- Catalogo con precios por cuenta, region, canal o volumen.
- Reglas de catalogo por cliente, zona, canal, region y segmento.
- Multicanal y multiregion con surtidos, precios, impuestos y condiciones diferenciadas.
- Compra por unidad, caja, multiplo, minimo y pallet.
- Presupuesto, aprobaciones, companias y roles.
- Admin operativo para contenido, packaging y datos B2B.
- Storefront industrial sobrio, rapido y responsive.
- Import/export para equipos comerciales y operaciones.

## Documentos Clave

- Auditoria de estado: `docs/b2b-template/audit-estado.md`
- Onboarding de cliente: `docs/b2b-template/client-onboarding.md`
- Nuevo cliente en 60 minutos: `docs/b2b-template/nuevo-cliente-60-minutos.md`
- Catalogo de modulos: `docs/b2b-template/module-catalog.md`
- Roadmap: `docs/b2b-template/roadmap.md`

## Capas Del Template

| Capa | Estado | Proposito |
| --- | --- | --- |
| Medusa backend B2B | Base existente | Companias, empleados, aprobaciones, presupuestos, carrito y checkout. |
| Product packaging module | Implementado | Reglas por variante: unidad/caja, minimo, multiplo, pallet, peso, dimensiones. |
| Catalog/pricing rules | Pendiente estrategico | Descuentos y visibilidad por cliente, zona, canal, region y segmento apoyandose en core Medusa. |
| Multicanal/multiregion | Pendiente estrategico | Sales channels, regiones, monedas, impuestos, surtidos y condiciones comerciales por mercado. |
| Homepage content module | Implementado | Contenido editable de home desde backend. |
| Admin widgets | Implementado parcial | Edicion de packaging y acciones masivas basicas. |
| Storefront B2B | Implementado NGS | Home, PDP, catalogo, carrito y presupuesto con patron industrial. |
| Import/export ops | Implementado parcial | CSV packaging por SKU y CSV de carrito. |
| Client adapter | Implementado parcial | Perfiles JSON sincronizables para marca, home, nav, footer, SEO, store, checkout, PDP fallbacks y assets; upload local desde Admin para demos. |
| Template CLI/onboarding | Implementado inicial | Crear perfiles nuevos desde plantilla o perfil existente, validar y sincronizar artefactos. |

## Principio De Arquitectura

Todo lo reusable debe vivir como core B2B. Todo lo especifico de cliente debe vivir como configuracion, seed o assets.

```text
b2b-core
  backend modules
  workflows
  API routes
  admin widgets
  storefront primitives

client-profile
  brand tokens
  homepage content
  category taxonomy
  product packaging CSV
  sample data seed
  images/assets
```

## Que No Debe Quedar Hardcodeado

- Nombre de marca: NGS, Electronics, Blake, etc.
- Colores y logo.
- Textos de home/PDP/footer.
- Categorias principales y mega menu.
- Reglas de packaging por SKU.
- Mensajes comerciales como "audio profesional".
- URLs de deploy.
- Publishable keys o secretos.

## Definition Of Done Para Considerarlo Template

1. Un nuevo cliente puede configurarse editando un `client-profile`.
2. El admin permite editar contenido esencial sin tocar codigo.
3. Packaging se puede importar/exportar por CSV.
4. El storefront no contiene copy de NGS fuera del perfil activo.
5. El backend valida reglas B2B en add-to-cart, edicion de carrito y checkout.
6. Hay reglas demostrables de precio/catalogo por cliente, region, canal o segmento.
7. La demo seed crea datos consistentes en menos de 10 minutos.
8. Hay guia de despliegue Render/Vercel y guia local.
9. Hay tests o checks automatizados para las reglas criticas.

## Perfil Activo En Storefront

El storefront carga el perfil activo desde `NEXT_PUBLIC_B2B_CLIENT_PROFILE`.

Valor por defecto:

```env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=ngs
```

Los perfiles fuente viven en:

```text
profiles/<cliente>/client-profile.json
profiles/<cliente>/homepage-content.json
profiles/<cliente>/product-packaging.csv
profiles/<cliente>/assets
```

Vercel solo despliega `apps/storefront`, asi que antes de construir se empaquetan los perfiles con:

```bash
pnpm validate:client-profiles
pnpm sync:client-profile
```

`validate:client-profiles` no escribe artefactos. Revisa estructura de `client-profile.json`, home, menu, footer, CSV de packaging, CSV de productos y referencias a assets. Por defecto los assets faltantes son warnings para no bloquear demos tempranas; usa `--strict-assets` para convertirlos en error.

El comando:

- Valida que cada perfil tenga los campos minimos.
- Copia `client-profile.json` y `homepage-content.json` a `apps/storefront/src/lib/client-profile/profiles`.
- Copia assets de `profiles/<cliente>/assets` a `apps/storefront/public/images/<cliente>`.
- Regenera `apps/storefront/src/lib/client-profile/generated-profiles.ts`.

Perfiles actuales:

- `ngs`: demo real.
- `example-industrial`: perfil generico para validar que el template no depende de NGS.

## Nuevo Cliente En 10 Minutos

1. Crea el perfil:

```bash
pnpm template:new -- --id <cliente> --name "Nombre Cliente" --from example-industrial
```

2. Revisa `profiles/<cliente>/activation-checklist.md`.
3. Revisa `profiles/<cliente>/.env.example`.
4. Revisa `profiles/<cliente>/client-profile.json`.
5. Revisa `profiles/<cliente>/homepage-content.json`.
6. Sustituye `profiles/<cliente>/product-packaging.csv` con SKUs reales.
7. Deja assets en `profiles/<cliente>/assets` y referencia rutas `/images/<cliente>/...`.
8. Ejecuta `pnpm validate:client-profiles -- --id <cliente>`.
9. Ejecuta `pnpm sync:client-profile` si usaste `--no-sync` o editaste archivos manualmente.
10. Define `NEXT_PUBLIC_B2B_CLIENT_PROFILE=<cliente>`.
11. Define `B2B_CLIENT_PROFILE=<cliente>` en backend si vas a sembrar datos.
12. Ejecuta `pnpm seed:product-catalog` para crear productos demo desde `product-catalog.csv`.
13. Ejecuta `pnpm seed:product-packaging` para aplicar reglas de packaging por SKU.
14. Ejecuta `pnpm --filter @b2b-starter/storefront build`.

Para una activacion guiada con tiempos, entregables y demo script, usa `docs/b2b-template/nuevo-cliente-60-minutos.md`.

Opciones utiles:

```bash
pnpm template:new -- --id acme-industrial --name "ACME Industrial" --from ngs --accent "#d71920" --tagline "Portal profesional ACME"
pnpm template:new -- --id embalajes-demo --name "Embalajes Demo" --vertical packaging
pnpm template:new -- --id acme-industrial --name "ACME Industrial" --dry-run
pnpm template:new -- --id acme-industrial --name "ACME Industrial" --no-sync
pnpm validate:client-profiles -- --id acme-industrial --strict-assets
```

Cada perfil generado incluye `README.md`, `activation-checklist.md`, `.env.example`, `client-profile.json`, `homepage-content.json`, `product-packaging.csv` y carpeta `assets/`. Si usas `--vertical`, el CSV de packaging se genera con SKUs demo y reglas acordes al sector.

Vertical packs disponibles:

- `audio`: altavoces, instalaciones, eventos, accesorios y reglas por caja/equipo.
- `packaging`: cajas, sobres, proteccion, etiquetas, precintos y reglas por pallet.
- `hardware`: ferreteria industrial, herramientas, EPIs y consumibles.
- `electrical`: material electrico, instaladores, proyectos y bobinas/cajas.
- `spare-parts`: repuestos, consumibles, maquinaria y cajas pequenas.

## Assets Desde Admin

Admin > Assets permite registrar rutas existentes o subir imagenes desde el equipo. En esta fase, los archivos subidos se guardan en el filesystem del backend y se sirven desde `/asset-files/<filename>`.

Esto es suficiente para demos y POCs. Para produccion real, el siguiente paso es sustituir esa capa por storage persistente tipo S3, R2 o equivalente, manteniendo el mismo contrato de Asset Library.

## Packaging Desde Admin

En Admin > Products > producto > Packaging B2B se pueden editar reglas por variante, aplicar una regla a todas las variantes, copiar reglas desde otra variante, usar plantillas rapidas, exportar CSV e importar CSV.

La importacion no aplica cambios inmediatamente: primero abre un preview con filas validas, errores por fila y emparejamiento por `variant_id` o `sku`. Solo las filas validas se aplican al confirmar.

## Catalogo Desde Perfil

Cada perfil puede incluir `product-catalog.csv` con una fila por variante:

```csv
handle,title,category,description,sku,variant_title,color,price_eur,image_url
altavoz-activo-12,ACME Altavoz activo 12,Audio,Altavoz profesional,ACME-AUDIO-12-BLK,Black,Black,549,/images/acme/product-1.png
```

Despues de `pnpm sync:client-profile`, el backend genera un JSON de catalogo por perfil. El comando `pnpm seed:product-catalog` lee `B2B_CLIENT_PROFILE` o `NEXT_PUBLIC_B2B_CLIENT_PROFILE`, crea categorias faltantes y crea productos que no existan por `handle`.

El seed es idempotente a nivel de producto: si un `handle` ya existe, lo salta para no duplicar catalogo en entornos de demo.
