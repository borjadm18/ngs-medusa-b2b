# Nuevo Cliente En 60 Minutos

Guia operativa para activar una demo B2B industrial sobre este template sin tocar componentes React ni reprogramar flujos Medusa.

El objetivo no es entregar una tienda final en una hora. El objetivo es llegar a una demo defendible con marca, home, catalogo, packaging B2B, carrito y presupuesto usando datos del cliente o datos verticales de ejemplo.

## Resultado Esperado

Al final del proceso debe existir:

- Perfil cliente en `profiles/<cliente>`.
- Marca, menu, home y footer configurados por JSON.
- Catalogo demo en `product-catalog.csv`.
- Packaging B2B por SKU en `product-packaging.csv`.
- Artefactos sincronizados para storefront y backend.
- Storefront construible con `NEXT_PUBLIC_B2B_CLIENT_PROFILE=<cliente>`.
- Backend sembrable con catalogo y packaging del perfil.

## Minuto 0-10: Crear Perfil Base

Elegir el punto de partida:

- `--from example-industrial`: suministro industrial generico.
- `--vertical audio`: audio/electronica profesional.
- `--vertical packaging`: embalaje, cajas, sobres y consumibles.
- `--vertical hardware`: ferreteria industrial.
- `--vertical electrical`: material electrico.
- `--vertical spare-parts`: repuestos y mantenimiento.

Comando recomendado:

```bash
pnpm template:new -- --id acme-industrial --name "ACME Industrial" --from example-industrial --accent "#d71920"
```

Alternativa por vertical:

```bash
pnpm template:new -- --id demo-packaging --name "Demo Packaging" --vertical packaging
```

Revisar:

```txt
profiles/<cliente>/README.md
profiles/<cliente>/activation-checklist.md
profiles/<cliente>/.env.example
```

## Minuto 10-25: Marca, Home Y Navegacion

Editar:

```txt
profiles/<cliente>/client-profile.json
profiles/<cliente>/homepage-content.json
```

Cambios minimos:

- `brand.name`
- `brand.legalName`
- `brand.tagline`
- `brand.colors.accent`
- `seo.title`
- `seo.description`
- `navigation.main`
- `footer.description`
- `heroTitle`
- `heroBody`
- `featuredCategories`
- `commercialCtaTitle`

Assets:

```txt
profiles/<cliente>/assets
```

Rutas esperadas:

```txt
/images/<cliente>/logo-light.png
/images/<cliente>/logo-dark.png
/images/<cliente>/home-hero.png
```

En demos tempranas, los assets faltantes pueden quedar como warning. Para bloquear activacion incompleta:

```bash
pnpm validate:client-profiles -- --id <cliente> --strict-assets
```

## Minuto 25-40: Catalogo Y Packaging

Catalogo:

```txt
profiles/<cliente>/product-catalog.csv
```

Columnas:

```csv
handle,title,category,description,sku,variant_title,color,price_eur,image_url
```

Packaging:

```txt
profiles/<cliente>/product-packaging.csv
```

Columnas:

```csv
sku,variant_id,sales_unit,minimum_order_quantity,quantity_increment,units_per_box,boxes_per_pallet,package_weight,package_dimensions
```

Reglas practicas:

- Si hay SKU, no hace falta `variant_id` para el seed inicial.
- `sales_unit` debe ser `unit` o `box`.
- `minimum_order_quantity` y `quantity_increment` deben reflejar compras reales.
- En B2B industrial, evitar cantidades libres si el almacen opera por caja.
- Usar peso y dimensiones aunque sean estimados: mejoran presupuesto, logistica y demo comercial.

## Minuto 40-50: Sincronizar Y Validar

Ejecutar:

```bash
pnpm validate:client-profiles -- --id <cliente>
pnpm sync:client-profile
```

El sync genera:

```txt
apps/storefront/src/lib/client-profile/profiles/<cliente>.json
apps/storefront/src/lib/client-profile/profiles/<cliente>-homepage.json
apps/backend/src/migration-scripts/generated-client-profiles/<cliente>-product-catalog.json
apps/backend/src/migration-scripts/generated-client-profiles/<cliente>-product-packaging.json
```

Validar build:

```bash
NEXT_PUBLIC_B2B_CLIENT_PROFILE=<cliente> pnpm --filter @b2b-starter/storefront build
pnpm --filter @b2b-starter/backend build
```

## Minuto 50-60: Sembrar Y Probar

Configurar entorno:

```env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=<cliente>
B2B_CLIENT_PROFILE=<cliente>
```

Sembrar backend:

```bash
pnpm seed:product-catalog
pnpm seed:product-packaging
```

Validacion minima en navegador:

- Home muestra marca y hero del perfil.
- Catalogo lista productos del CSV.
- PDP permite seleccionar variante.
- PDP muestra compra por unidad/caja.
- Carrito bloquea cantidades invalidas.
- Carrito oculta precios si el usuario no ha iniciado sesion.
- Presupuesto refleja lineas y cantidades.
- Admin permite editar packaging por variante.

## Demo Script Para Reuniones

1. Abrir home y explicar que marca, copy, menu y assets salen del perfil.
2. Ir a catalogo y filtrar por categoria.
3. Abrir PDP y mostrar unidad/caja, minimo, multiplo y tooltip logistico.
4. Intentar cantidad invalida para demostrar validacion B2B.
5. Anadir cantidad valida y abrir carrito.
6. Convertir carrito en presupuesto.
7. Entrar al Admin y mostrar packaging por variante, import/export y catalog rules.
8. Explicar que un cliente nuevo se activa cambiando JSON + CSV + assets.

## Criterio De Aceptacion

Una demo esta lista cuando:

- `pnpm validate:client-profiles -- --id <cliente>` no falla.
- `pnpm sync:client-profile` genera catalogo y packaging.
- Storefront build pasa.
- Backend build pasa.
- Hay al menos 6 productos demo y 6 reglas de packaging.
- No hay copy de NGS visible salvo que el perfil activo sea `ngs`.
- El comprador puede recorrer home, catalogo, PDP, carrito y presupuesto sin errores 500.

