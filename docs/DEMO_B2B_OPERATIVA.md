# Demo B2B operativa

Este documento resume el recorrido recomendado para una demo externa o reunion interna del portal B2B industrial.

## URLs

- Storefront: https://storefront-virid-three-41.vercel.app/es
- Catalogo: https://storefront-virid-three-41.vercel.app/es/store
- Backend/Admin: https://ngs-medusa-backend.onrender.com/app

## Usuarios demo

Password para todos los usuarios creados por seed: `Demo123!`

Empresas demo:

- Iberia Pro Installers
  - Admin empresa: `compras+admin@iberia-pro-installers.demo`
  - Comprador: `compras+buyer@iberia-pro-installers.demo`
  - Aprobador: `compras+approver@iberia-pro-installers.demo`
  - Estado: aprobada
  - Condiciones: credito 30 dias

- Distribuciones Norte Audio
  - Admin empresa: `pedidos+admin@dnaudio.demo`
  - Comprador: `pedidos+buyer@dnaudio.demo`
  - Aprobador: `pedidos+approver@dnaudio.demo`
  - Estado: aprobada
  - Condiciones: credito 60 dias

- Retail Campus Group
  - Admin empresa: `it-procurement+admin@retail-campus.demo`
  - Comprador: `it-procurement+buyer@retail-campus.demo`
  - Aprobador: `it-procurement+approver@retail-campus.demo`
  - Estado: pendiente
  - Condiciones: transferencia bancaria

## Flujo recomendado

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

## Validaciones antes de demo

- Storefront `/es/store` responde 200.
- Backend `/health` responde 200.
- Login con al menos un usuario demo funciona.
- Admin abre `B2B Control`.
- Hay quotes demo en estado pendiente de cliente/comercial.
- Un producto permite ver unidad/caja sin scroll visual raro.

## Limitaciones conocidas

- Los metodos de pago guardados son demo-operativos en metadata, no tokenizacion bancaria real.
- Las invitaciones crean el estado invitado y el customer, pero no envian email real.
- Las condiciones de pago se guardan y se muestran, pero no hay motor de credito financiero completo.
- Los pedidos historicos dependen del seed y de la actividad real generada durante la demo.
