# Example Industrial Profile

Perfil generico para validar que el starter no depende de NGS.

Incluye:

- `client-profile.json`: marca, navegacion, footer y copy base.
- `homepage-content.json`: home editable por JSON.
- `product-catalog.csv`: 8 productos industriales demo con variantes y precio EUR.
- `product-packaging.csv`: reglas B2B por SKU para caja, minimo, multiplo, pallet, peso y dimensiones.

Uso:

```bash
NEXT_PUBLIC_B2B_CLIENT_PROFILE=example-industrial
pnpm sync:client-profile
pnpm --filter @b2b-starter/storefront build
```

Para sembrar backend con este perfil:

```bash
B2B_CLIENT_PROFILE=example-industrial pnpm seed:product-catalog
B2B_CLIENT_PROFILE=example-industrial pnpm seed:product-packaging
```

Este perfil reutiliza imagenes existentes de NGS para evitar anadir assets pesados. En un cliente real, coloca los assets en `profiles/example-industrial/assets` y referencia rutas bajo `/images/example-industrial/...`.
