# Demo B2B - Playbook Simplificado

Objetivo: demostrar que el proyecto no es solo una tienda online, sino una base para digitalizar la relacion comercial B2B.

Formula de cada bloque:

1. Problema: que duele hoy.
2. Mostrar: pantalla o flujo.
3. Impacto: que cambia para negocio.

## Ruta Principal

- Storefront: https://storefront-virid-three-41.vercel.app/es
- Playbook guiado: https://storefront-virid-three-41.vercel.app/es/ngs-poc
- Catalogo: https://storefront-virid-three-41.vercel.app/es/store
- Cuenta: https://storefront-virid-three-41.vercel.app/es/account
- Admin: https://ngs-medusa-backend.onrender.com/app

## Usuarios Demo

Password storefront verificada: `Demo123!`

| Empresa | Comprador verificado | Contexto |
| --- | --- | --- |
| Iberia Pro Installers | `compras+buyer@iberia-pro-installers.demo` | Cliente aprobado, credito 30 dias |
| Distribuciones Norte Audio | `pedidos+buyer@dnaudio.demo` | Distribuidor aprobado, credito 60 dias |
| Retail Campus Group | `it-procurement+buyer@retail-campus.demo` | Empresa aprobada, transferencia bancaria |

Backoffice Medusa:

- URL: `https://ngs-medusa-backend.onrender.com/app`
- Email verificado: `admin@test.com`
- Password verificada: `supersecret`

## Guion

### 0. El Problema Actual

Foco: crear identificacion.

Mostrar:
- Email de pedido.
- Excel de tarifas.
- ERP.
- Storefront B2B.

Decir:
Muchas empresas ya tienen ERP, CRM y sistemas internos, pero la relacion comercial sigue dependiendo de emails, llamadas y tareas manuales. La pregunta es: que parte de este proceso podria gestionar directamente el cliente.

### 1. Catalogo Digital

Foco: el cliente encuentra informacion sin depender del comercial.

Mostrar:
- Categorias.
- Producto.
- Documentacion.
- Precio oculto o acceso requerido.

Decir:
El catalogo puede ser publico. Lo que no tiene por que ser publico son las condiciones comerciales.

Estado: listo.

### 2. Registro De Empresa

Foco: el alta de nuevos clientes puede ser autoservicio.

Mostrar:
- Formulario.
- Solicitud.
- Aprobacion.

Decir:
Un nuevo cliente puede solicitar acceso sin depender de intercambios de correos. La empresa mantiene control sobre quien accede y en que condiciones.

Estado: listo para mostrar con formulario y estado pendiente.

### 3. Cuenta De Empresa

Foco: en B2B el cliente es una organizacion.

Mostrar:
- Empresa.
- Usuarios.
- Direcciones.
- Historial.

Decir:
En B2C normalmente hablamos de usuarios. En B2B hablamos de empresas. Cada empresa tiene equipo, historial, direcciones y condiciones comerciales.

Estado: listo.

### 4. Roles Y Aprobaciones

Foco: la plataforma refleja la estructura de compra del cliente.

Mostrar:
- Comprador.
- Aprobador.
- Pedido pendiente.
- Aprobacion.

Decir:
No todas las personas pueden comprar lo mismo. Muchas empresas tienen limites, aprobaciones y responsabilidades distintas.

Estado: listo para demo guiada. La pagina de aprobaciones explica el flujo comprador > limite > aprobador > checkout desbloqueado. Conviene entrar previamente con comprador y aprobador.

### 5. Condiciones Comerciales

Foco: cada cliente ve sus propias condiciones.

Mostrar:
- Mismo producto.
- Dos clientes.
- Dos precios.

Decir:
En B2B no existe un unico precio. Cada cliente puede tener condiciones negociadas diferentes.

Estado: listo en el playbook guiado. La pagina `/es/ngs-poc` incluye una comparativa directa de productos con visitante publico, Iberia Pro Installers y Distribuciones Norte Audio.

### 6. Quick Order

Foco: comprar rapido.

Mostrar:
- Busqueda por SKU.
- Varias referencias.
- Pedido masivo.

Decir:
Un comprador profesional normalmente ya sabe que necesita. No quiere navegar por todo el catalogo.

Estado: listo.

### 7. Solicitud De Presupuesto

Foco: digitalizar la negociacion.

Mostrar:
- Carrito.
- Solicitar presupuesto.
- Revision.
- Conversion a pedido.

Decir:
No todas las compras son inmediatas. El presupuesto deja de vivir en emails y pasa a formar parte del proceso digital.

Estado: listo. Antes de demo ejecutar `pnpm smoke:demo-readiness`.

### 8. Checkout B2B

Foco: el pedido recoge toda la informacion necesaria para operar.

Mostrar:
- Direccion.
- PO Number.
- Condiciones de pago.
- Confirmacion.

Decir:
Una empresa no compra igual que un consumidor. Necesita indicar donde entregar, como facturar y en que condiciones comprar.

Estado: listo.

### 9. Reorder

Foco: la mayoria de pedidos B2B son recurrentes.

Mostrar:
- Historial.
- Repetir pedido.
- Confirmar.

Decir:
El cliente no deberia reconstruir un pedido desde cero cada vez.

Estado: listo. El historial de pedidos muestra un bloque de Reorder y un boton `Repetir pedido` que envia referencias y cantidades al carrito.

### 10. Workflows

Foco: automatizar procesos.

Mostrar:
Cliente nuevo > Solicitud > Aprobacion > Tarifa asignada > Acceso concedido.

Decir:
Lo importante no es unicamente digitalizar pantallas. Tambien es digitalizar procesos.

Estado: listo para demo guiada. `/es/ngs-poc` incluye timeline visual solicitud > revision > tarifa > acceso.

### 11. Integraciones

Foco: el ecommerce forma parte del ecosistema.

Mostrar:
ERP/CRM/PIM/WMS > Ecommerce B2B.

Decir:
El ecommerce no sustituye a los sistemas existentes. Se conecta con ellos.

Estado: listo para demo conceptual. `/es/ngs-poc` incluye mapa ERP/CRM/PIM/WMS alrededor de Medusa B2B.

### 12. Extensibilidad

Foco: aqui brilla Medusa.

Mostrar:
- Procesos propios.
- Campos propios.
- Integraciones.

Decir:
Ninguna empresa funciona exactamente igual. La plataforma debe adaptarse a los procesos del negocio.

Estado: listo a nivel explicacion tecnica y ejemplos ya construidos.

## Prioridades Reordenadas

### P0 - Demo defendible

- Playbook guiado en `/es/ngs-poc`.
- Smoke `pnpm smoke:demo-readiness` antes de la reunion.
- Validar login, catalogo, quick order, quotes y checkout.
- Mantener quotes `pending_customer` disponibles.

### P1 - Huecos que mas afectan al guion

- Pantalla comparativa de precios por cliente. Estado: implementada en `/es/ngs-poc`.
- Reorder mas visible. Estado: implementado desde historial de pedidos.
- Validar `accept quote` en dry-run antes de una demo externa.
- Mantener preparado un carrito/pedido que supere limite para aprobaciones.

### P2 - Profundidad B2B industrial

- Reglas de catalogo por cliente, zona y canal mas demostrables.
- Packaging/logistica en PDF/CSV de presupuesto.
- Import/export operacional de catalogo, packaging y condiciones.

### P3 - Template reusable

- Convertir playbook, datos demo y assets en perfil reutilizable por cliente.
- Launcher de nueva demo.
- Documentacion de venta/implantacion por vertical.
