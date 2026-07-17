# B2B Industrial Starter Profile

Perfil limpio para arrancar una tienda B2B industrial nueva sin datos demo de cliente.

## Archivos

- `client-profile.json`: marca, SEO, navegacion, footer y fallbacks.
- `homepage-content.json`: hero, bloques comerciales, categorias y productos destacados.
- `product-catalog.csv`: cabecera CSV lista para productos reales.
- `product-packaging.csv`: cabecera CSV lista para reglas reales por SKU o variante.
- `assets/`: logos e imagenes que se publicaran como `/images/starter-empty/...`.

## Origen

Generado desde `template` y vaciado intencionadamente para funcionar como starter neutro.

## Activacion

```bash
pnpm sync:client-profile
NEXT_PUBLIC_B2B_CLIENT_PROFILE=starter-empty pnpm --filter @b2b-starter/storefront build
```

Para produccion, configura `NEXT_PUBLIC_B2B_CLIENT_PROFILE=starter-empty` en Vercel y `B2B_CLIENT_PROFILE=starter-empty` en backend. Despues sustituye los CSV vacios por datos reales o importa productos desde PIM/ERP.

Consulta `activation-checklist.md` para el checklist completo de activacion y QA.
