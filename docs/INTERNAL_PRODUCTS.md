# Productos Internos B2B Medusa

Este repo se organiza como tres productos internos relacionados, pero con objetivos distintos. La regla principal: la demo vende, el starter acelera proyectos reales y el generador reduce el tiempo de POC por cliente.

## 1. Demo Comercial Publica

**Objetivo:** una tienda viva que cualquier stakeholder pueda abrir para entender el valor de Medusa B2B industrial.

**Perfil principal:** `profiles/ngs`

**URLs actuales:**

- Storefront: `https://storefront-virid-three-41.vercel.app/es`
- Backend/Admin: `https://ngs-medusa-backend.onrender.com/app`

**Debe demostrar:**

- Home comercial con marca, assets y categorias.
- Catalogo B2B con productos reales de Medusa.
- PDP con compra por unidad/caja, minimos, multiplos y packaging.
- Precios privados tras login.
- Carrito con validacion B2B.
- Presupuestos, aprobaciones, empresas y usuarios.
- Admin con packaging, assets, home, brand profile, menu y catalog rules.

**No debe ser:**

- Una base limpia para nuevos clientes.
- El lugar donde meter datos genericos de todos los sectores.
- Un fork por cada prospect.

**Comandos utiles:**

```bash
pnpm product:demo:check
pnpm smoke:demo-readiness
```

## 2. Framework / Starter Limpio

**Objetivo:** base reusable para crear tiendas B2B industriales reales sin arrastrar datos NGS/Novisound.

**Perfil principal:** `profiles/starter-empty`

**Debe incluir:**

- Backend Medusa con modulos B2B propios y del starter.
- Storefront Next.js B2B sin copy de cliente.
- Admin operativo para contenido, marca, assets, packaging y reglas.
- Contrato de `client-profile`, `homepage-content`, `product-catalog` y `product-packaging`.
- CSVs vacios o ejemplo, nunca datos de demo obligatorios.

**Debe permitir:**

- Clonar repo.
- Configurar envs.
- Activar `starter-empty`.
- Importar productos reales.
- Tener una tienda funcional aunque el catalogo empiece vacio.

**Comandos utiles:**

```bash
pnpm product:starter:check
NEXT_PUBLIC_B2B_CLIENT_PROFILE=starter-empty pnpm --filter @b2b-starter/storefront build
```

## 3. Generador De POCs Por Cliente

**Objetivo:** crear en horas una demo adaptada a un cliente concreto investigando marca, categorias y algunos productos.

**Entrada esperada:**

- Nombre del cliente.
- Vertical: `audio`, `packaging`, `hardware`, `electrical`, `spare-parts` o `industrial`.
- Logo/assets iniciales.
- 4-10 productos o un CSV/PIM.
- Mensajes comerciales y categorias principales.

**Salida esperada:**

- `profiles/<cliente>/client-profile.json`
- `profiles/<cliente>/homepage-content.json`
- `profiles/<cliente>/product-catalog.csv`
- `profiles/<cliente>/product-packaging.csv`
- `profiles/<cliente>/assets`
- checklist de activacion

**Comando base actual:**

```bash
pnpm product:poc:new -- --id acme-industrial --name "ACME Industrial" --vertical industrial
pnpm validate:client-profiles -- --id acme-industrial
pnpm sync:client-profile
```

**Siguiente evolucion:** convertir este flujo en un skill/launcher guiado que investigue cliente, proponga perfil, genere assets placeholder y prepare la demo.

## Separacion De Responsabilidades

| Capa | Demo comercial | Starter limpio | Generador POC |
| --- | --- | --- | --- |
| Perfil | `ngs` | `starter-empty` | `<cliente>` |
| Datos | ricos y narrativos | vacios/neutros | adaptados al prospect |
| Objetivo | vender vision | acelerar delivery | crear demos rapidas |
| Deploy | publico estable | plantilla clonable | preview por cliente |
| Riesgo principal | romper demo | arrastrar hardcodes | generar datos pobres |

## Definition Of Done

### Demo Comercial

- Home, PLP, PDP, carrito, login, cuenta y presupuesto sin errores 500.
- Usuarios demo documentados.
- Productos demo visibles en front y backoffice.
- Admin permite cambiar logo, menu, home, assets, packaging y reglas.

### Starter Limpio

- `starter-empty` valida.
- No hay textos NGS visibles al activar `starter-empty`.
- CSVs vacios no rompen seeds ni storefront.
- Build de backend y storefront pasan.

### Generador POC

- `pnpm product:poc:new` crea perfil completo.
- El perfil valida con warnings razonables de assets.
- `sync-client-profile` genera artefactos frontend/backend.
- Existe una guia de demo de 60 minutos para entregar el POC.

## Roadmap Inmediato

1. Mantener la demo NGS estable y corregir Render/GitHub.
2. Usar `starter-empty` como contrato limpio de nuevos proyectos.
3. Convertir `template:new` en launcher interactivo.
4. Crear vertical packs con productos e imagenes placeholder mejores.
5. Documentar flujo Medusa Cloud para pasar de Render/Vercel a entorno gestionado.
