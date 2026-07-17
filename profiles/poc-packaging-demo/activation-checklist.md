# Activacion POC Packaging Demo

Checklist para convertir este perfil en una demo B2B funcional.

## 1. Revisar perfil

- [ ] `client-profile.json`: marca, SEO, colores, logo, menu, footer y fallbacks.
- [ ] `homepage-content.json`: hero, categorias, bloques visuales, CTAs y productos destacados.
- [ ] `product-catalog.csv`: productos, categorias, variantes, precios base e imagenes.
- [ ] `product-packaging.csv`: SKUs reales, unidades/caja, minimos, multiplos, pallets y peso.
- [ ] `assets/`: logos e imagenes con rutas `/images/poc-packaging-demo/...`.

## 2. Sincronizar artefactos

```bash
pnpm sync:client-profile
```

## 3. Activar storefront local

```env
NEXT_PUBLIC_B2B_CLIENT_PROFILE=poc-packaging-demo
```

```bash
pnpm --filter @b2b-starter/storefront build
```

## 4. Activar backend/seed

```env
B2B_CLIENT_PROFILE=poc-packaging-demo
```

Si hay reglas de packaging nuevas, ejecutar seed/migracion segun entorno.

## 5. Deploy

- [ ] Vercel storefront: `NEXT_PUBLIC_B2B_CLIENT_PROFILE=poc-packaging-demo`.
- [ ] Render backend: `B2B_CLIENT_PROFILE=poc-packaging-demo`.
- [ ] Confirmar region/pais por defecto: `es`.
- [ ] Confirmar moneda: `EUR`.
- [ ] Confirmar assets visibles en home y PDP.

## 6. QA minimo

- [ ] Home carga en desktop y mobile.
- [ ] Menu y mega menu muestran enlaces correctos.
- [ ] Catalogo lista productos con imagen.
- [ ] PDP permite unidad/caja y muestra packaging.
- [ ] Carrito muestra precio solo con login y packaging/logistica.
- [ ] Presupuesto exporta CSV/PDF si aplica.
- [ ] Admin edita home, brand profile, assets y packaging.

## Origen

Generado desde `template`.
