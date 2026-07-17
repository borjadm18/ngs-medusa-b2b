# Demo Del Starter Vacio

Objetivo: ensenar internamente que el proyecto no es solo la demo NGS, sino una base reutilizable para crear ecommerce B2B industriales.

## Que demuestra

- La arquitectura B2B existe sin datos de cliente.
- La home, menu, marca y textos salen de `profiles/starter-empty`.
- El catalogo puede arrancar vacio sin romper storefront ni backend.
- El Admin conserva las capacidades: logo, menu, assets, home, packaging, reglas, empresas y aprobaciones.

## Activacion local

Storefront:

```bash
$env:NEXT_PUBLIC_B2B_CLIENT_PROFILE="starter-empty"
pnpm --filter @b2b-starter/storefront build
```

Backend:

```bash
$env:B2B_CLIENT_PROFILE="starter-empty"
pnpm seed:product-catalog
pnpm seed:product-packaging
```

## Archivos editables

```txt
profiles/starter-empty/client-profile.json
profiles/starter-empty/homepage-content.json
profiles/starter-empty/product-catalog.csv
profiles/starter-empty/product-packaging.csv
profiles/starter-empty/assets/
```

## Guion de 5 minutos

1. Abrir `profiles/starter-empty` y mostrar que no contiene datos NGS.
2. Mostrar `product-catalog.csv` y `product-packaging.csv` vacios.
3. Ejecutar `pnpm product:starter:check`.
4. Explicar que un cliente nuevo se activa rellenando JSON + CSV + assets.
5. Crear un POC rapido:

```bash
pnpm product:poc:new -- --id demo-electrical --name "Demo Electrical" --vertical electrical --from-url https://example.com --dry-run
```

6. Enseñar que el comando genera un perfil completo y un brief de investigacion cuando se usa `--from-url`.

## Definition of Done

- `pnpm product:starter:check` pasa.
- Build storefront con `starter-empty` pasa.
- No aparece copy NGS.
- No hay productos demo obligatorios.
- El equipo entiende que `starter-empty` es la base, no la demo comercial.

