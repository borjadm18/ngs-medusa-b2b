# Runbook De Presentacion B2B

Guion corto para ejecutar la demo interna/externa sin improvisar.

## 1. Apertura

Objetivo: explicar que no es una landing estatica, sino una base Medusa con storefront, backoffice y datos B2B.

- Storefront: `https://storefront-virid-three-41.vercel.app/es`
- Catalogo: `https://storefront-virid-three-41.vercel.app/es/store`
- Admin: `https://ngs-medusa-backend.onrender.com/app`

Mensaje clave:

> Es una base B2B industrial sobre Medusa: catalogo privado, empresas, roles, presupuestos, reglas comerciales, packaging y backoffice extensible.

## 2. Catalogo Publico Sin Precio

Ruta: `/es/store`

Mostrar:

- El catalogo es navegable sin login.
- Los precios no se muestran hasta validar acceso B2B.
- Esto replica un caso habitual industrial: catalogo abierto, tarifa privada.

Prueba que valida:

- Control de visibilidad de precio.
- Separacion entre descubrimiento publico y compra B2B.

## 3. Login Como Comprador

Usuario recomendado:

- Email: `pedidos+buyer@dnaudio.demo`
- Password: `Demo123!`

Por que este usuario:

- Mantiene un presupuesto `pending_customer` para aceptar durante demo.
- Tiene empresa aprobada, condiciones de pago y metodos demo.

Mostrar:

- Cuenta B2B.
- Empresa.
- Pedidos historicos.
- Presupuestos.
- Pedido rapido.

## 4. PDP Y Compra Por Packaging

Ruta sugerida: abrir un producto desde catalogo.

Mostrar:

- Precio visible tras login.
- Variantes.
- Compra por unidad o caja.
- Informacion logistica en tooltip: caja, minimo, multiplo, pallet.

Mensaje clave:

> En B2B industrial la unidad de compra no siempre es una unidad suelta. La plataforma valida minimos, multiplos y cajas antes de llegar a checkout.

## 5. Pedido Rapido

Ruta: `/es/account/quick-order`

Mostrar:

- Entrada por SKU/referencia.
- Resolucion de productos.
- Cantidades orientadas a operativa de compras.

Mensaje clave:

> El comprador recurrente no quiere navegar como B2C; quiere pedir por referencia, copiar desde ERP o reponer rapido.

## 6. Presupuestos

Ruta: `/es/account/quotes`

Mostrar:

- Lista de presupuestos.
- Detalle de presupuesto pendiente.
- Aceptar presupuesto si se quiere cerrar el flujo.
- Logistica B2B: cajas, unidades, peso, volumen, peso facturable, ocupacion de pallet, expedicion sugerida y coste de transporte demo.
- Export CSV/print con datos de packaging y logistica.

Usuario con presupuesto pendiente:

- `pedidos+buyer@dnaudio.demo`

Precaucion:

- Aceptar una quote consume ese escenario demo. Antes de una demo externa, ejecutar el seed o comprobar que sigue existiendo una quote `pending_customer`.

## 7. Admin B2B

Ruta: `https://ngs-medusa-backend.onrender.com/app`

Credenciales demo:

- Email: `admin@test.com`
- Password: `supersecret`

Mostrar:

- B2B Control con KPIs logisticos: volumen, peso facturable, expedicion sugerida y transporte demo.
- Companies: altas, estado, CIF, condiciones y empleados.
- Quotes: revision comercial.
- Catalog Rules: reglas por cliente, categoria, zona o canal.
- Assets/Home/Brand si se quiere enseñar capacidad de adaptacion del template.

Mensaje clave:

> Medusa nos da la base commerce y nosotros hemos construido la capa B2B industrial: empresas, aprobaciones, reglas, packaging, quotes, contenido editable y datos demo.

## 8. Cierre

Cerrar con tres ideas:

- Demo comercial: lista para enseñar el valor.
- Framework: reusable para nuevas tiendas B2B.
- Siguiente fase: Medusa Cloud, hardening de produccion y empaquetado como starter.

## Checklist Antes De Entrar En Reunion

Ejecutar:

```bash
corepack pnpm@9.15.0 product:demo:check
$env:ADMIN_EMAIL="admin@test.com"; $env:ADMIN_PASSWORD="supersecret"; corepack pnpm@9.15.0 smoke:playbook-p0
corepack pnpm@9.15.0 qa:playbook-visual
```

Estado esperado:

- `product:demo:check`: 0 fallos.
- `smoke:playbook-p0` con Admin: 58 OK.
- `qa:playbook-visual`: sin issues visuales.

## Si Algo Falla En Vivo

- Si Render esta frio: esperar 30-60 segundos y recargar.
- Si una quote ya aparece aceptada: usar otro usuario demo o resembrar datos.
- Si Vercel muestra login: se esta abriendo un preview protegido; usar la URL estable de produccion.
- Si un usuario aparece pendiente: ejecutar aprobacion demo o aprobar desde Admin > Companies.

## Nota Sobre Logistica

La demo calcula:

- Peso real estimado desde `package_weight`.
- Volumen desde dimensiones tipo `460 x 330 x 610 mm`.
- Peso volumetrico con factor demo `250 kg/m3`.
- Peso facturable como maximo entre peso real y volumetrico.
- Expedicion sugerida: paqueteria estandar, multi-bulto o pallet/carga parcial.
- Coste de transporte demo por reglas internas.

Para un cliente real, este bloque debe conectarse a tarifas de transportista, zonas, codigos postales, servicios y restricciones de expedicion.
