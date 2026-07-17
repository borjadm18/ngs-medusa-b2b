# POC Packaging Demo Profile

Perfil generado para activar una demo B2B industrial sobre el template Medusa.

## Archivos

- `client-profile.json`: marca, SEO, navegacion, footer y fallbacks.
- `homepage-content.json`: hero, bloques comerciales, categorias y productos destacados.
- `product-catalog.csv`: productos, categorias, variantes, precios e imagenes base para seed/import.
- `product-packaging.csv`: reglas demo de packaging por SKU.
- `assets/`: logos e imagenes que se publicaran como `/images/poc-packaging-demo/...`.

## Origen

Generado desde `template`.

## Activacion

```bash
pnpm sync:client-profile
NEXT_PUBLIC_B2B_CLIENT_PROFILE=poc-packaging-demo pnpm --filter @b2b-starter/storefront build
```

Para produccion, configura `NEXT_PUBLIC_B2B_CLIENT_PROFILE=poc-packaging-demo` en Vercel y `B2B_CLIENT_PROFILE=poc-packaging-demo` en Render si quieres sembrar packaging de este perfil.

Consulta `activation-checklist.md` para el checklist completo de activacion y QA.
