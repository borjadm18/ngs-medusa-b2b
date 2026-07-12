# Example Industrial Profile

Perfil generico para validar que el starter no depende de NGS.

Uso:

```bash
NEXT_PUBLIC_B2B_CLIENT_PROFILE=example-industrial
pnpm sync:client-profile
pnpm --filter @b2b-starter/storefront build
```

Este perfil reutiliza imagenes existentes de NGS para evitar anadir assets pesados. En un cliente real, coloca los assets en `profiles/example-industrial/assets` y referencia rutas bajo `/images/example-industrial/...`.
