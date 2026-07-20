# Demo B2B operativa

Este documento resume el recorrido recomendado para una demo externa o reunion interna del portal B2B industrial.

## URLs

- Storefront: https://storefront-virid-three-41.vercel.app/es
- Catalogo: https://storefront-virid-three-41.vercel.app/es/store
- Backend/Admin: https://ngs-medusa-backend.onrender.com/app

## Usuarios demo

Password storefront verificada: `Demo123!`

Empresas demo:

- Iberia Pro Installers
  - Comprador verificado: `compras+buyer@iberia-pro-installers.demo`
  - Estado: aprobada
  - Condiciones: credito 30 dias

- Distribuciones Norte Audio
  - Comprador verificado: `pedidos+buyer@dnaudio.demo`
  - Estado: aprobada
  - Condiciones: credito 60 dias

- Retail Campus Group
  - Comprador verificado: `it-procurement+buyer@retail-campus.demo`
  - Estado: aprobada
  - Condiciones: transferencia bancaria

Backoffice Medusa:

- URL: `https://ngs-medusa-backend.onrender.com/app`
- Email verificado: `admin@test.com`
- Password verificada: `supersecret`

## Flujo recomendado

Este guion esta pensado para navegar directamente por la tienda, sin usar
`/es/ngs-poc`.

1. Entrar al catalogo sin login.
   - Mostrar que el catalogo existe, pero los precios/compras requieren acceso B2B.

2. Login como comprador.
   - Usar `compras+buyer@iberia-pro-installers.demo`.
   - Mostrar precios privados, stock operativo, PDP y compra por unidad/caja.

3. Pedido rapido.
   - Ir a cuenta > pedido rapido.
   - Resolver SKUs y cantidades por caja.
   - Mostrar validacion de packaging.

4. Carrito/checkout B2B.
   - Mostrar lineas con packaging.
   - Completar PO number, referencia interna, condiciones de pago y metodo guardado demo.

5. Presupuesto.
   - Solicitar quote desde carrito cuando aplique.
   - Entrar en admin > Quotes.
   - Revisar/modificar/enviar quote.
   - Volver como cliente y aceptar quote.

6. Empresa y equipo.
   - En cuenta > empresa, mostrar empleados.
   - Invitar empleado con rol y limite de gasto.
   - En admin > Companies, mostrar estado onboarding, CIF, sector, condiciones y empleados.

7. Reglas comerciales.
   - En admin > Catalog Rules, mostrar reglas por categoria/variante/empresa.
   - Explicar precios por cliente, descuentos por volumen y productos que requieren presupuesto.

8. B2B Control.
   - Cerrar con dashboard operativo:
     - empresas pendientes
     - valor de quotes
     - conversion
     - ticket medio
     - packaging
     - empresas con credito

## Ruta De Demo Directa

1. Abrir `https://storefront-virid-three-41.vercel.app/es`.
2. Ir a `Productos` > `Ver catalogo completo`.
3. Abrir una PDP y mostrar:
   - precio oculto si no hay login
   - variantes
   - compra por unidad/caja
   - informacion compacta de packaging
4. Iniciar sesion con `compras+buyer@iberia-pro-installers.demo`.
5. Repetir PDP para mostrar precio privado y add-to-cart.
6. Entrar al carrito:
   - lineas con cajas/unidades
   - peso/pallet
   - transportista/tarifa estimada demo
   - export de presupuesto si aplica
7. Ir a `Cuenta` > `Pedido rapido`:
   - cargar ejemplo o pegar CSV
   - resolver SKUs
   - validar minimos/multiplos
8. Ir a `Cuenta` > `Presupuestos`:
   - abrir quote pendiente
   - aceptar quote si se quiere demostrar conversion
9. Ir a `Cuenta` > `Empresa`:
   - datos fiscales
   - condiciones de pago
   - usuarios/roles
   - estado de aprobacion
10. Abrir backoffice:
   - `B2B Control`
   - `Companies`
   - `Approvals`
   - `Catalog Rules`
   - `Assets`
   - `Homepage`

## Frases De Defensa

- Medusa nos da el core ecommerce y la arquitectura extensible.
- La capa Novicell convierte ese core en B2B industrial: empresa, packaging, quotes, aprobaciones, tarifas privadas y operativa comercial.
- Shopify acelera mucho cuando el proceso encaja en SaaS. Medusa gana cuando el cliente necesita procesos propios, integraciones y control de modelo.
- El proyecto ya demuestra venta, presupuesto, aprobacion, empresa y packaging; lo que falta para producto completo es pulir CMS, storage, logistica real y automatizacion de setup.

## Validaciones antes de demo

- Ejecutar `pnpm demo:preflight:public:fast` para validar estado funcional.
- Ejecutar `pnpm demo:preflight:public` si hay margen para QA visual con screenshots.
- Storefront `/es/store` responde 200.
- Backend `/health` responde 200.
- Login con al menos un usuario demo funciona.
- El smoke `smoke:cart-packaging` crea un carrito demo, anade cajas y valida peso/pallet/metadata.
- Admin abre `B2B Control`.
- Hay quotes demo en estado pendiente de cliente/comercial.
- Un producto permite ver unidad/caja sin scroll visual raro.

## Limitaciones conocidas

- Los metodos de pago guardados son demo-operativos en metadata, no tokenizacion bancaria real.
- Las invitaciones crean el estado invitado y el customer, pero no envian email real.
- Las condiciones de pago se guardan y se muestran, pero no hay motor de credito financiero completo.
- Los pedidos historicos dependen del seed y de la actividad real generada durante la demo.
