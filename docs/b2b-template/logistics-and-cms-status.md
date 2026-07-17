# Estado: Logistica Y CMS

## Logistica Implementada

La base B2B ya calcula metricas logisticas desde las reglas de packaging guardadas por variante y copiadas a lineas de carrito/presupuesto.

Metricas disponibles:

- Cajas y unidades totales.
- Peso real estimado.
- Volumen estimado desde dimensiones `L x W x H mm`.
- Peso volumetrico con factor demo `250 kg/m3`.
- Peso facturable como maximo entre peso real y volumetrico.
- Ocupacion estimada de pallet.
- Expedicion sugerida: paqueteria estandar, multi-bulto o pallet/carga parcial.
- Coste de transporte demo.

Donde aparece:

- Detalle de presupuesto en storefront.
- Export CSV/print de presupuesto.
- Detalle de quote en Admin.
- B2B Control en Admin.

Pendiente para cliente real:

- Tarifas reales por transportista, zona, servicio y codigo postal.
- Restricciones por peso, volumen, mercancia y pais.
- Multiples opciones de envio.
- Creacion de expediciones, tracking y etiquetas.
- Auditoria de cambios en tarifa/logistica.

## CMS/Home/Assets Implementado

La base ya permite editar:

- Logo y perfil de marca.
- Contenido de homepage por secciones.
- CTAs, textos, metricas y bloques visuales.
- Biblioteca de assets por tipo y perfil cliente.

Mejoras recientes:

- Selector de assets con busqueda.
- Tarjetas de asset mas compactas.
- Contadores por tipo calculados sobre toda la biblioteca del perfil.
- Picker reusable mejorado para logo, brand profile y homepage.

Pendiente para cliente final:

- Vista tipo DAM con carpetas/colecciones.
- Drag/drop de orden en assets y bloques de home.
- Validacion visual de tamanos recomendados.
- Historial/versionado de cambios de contenido.
- Publicar borrador vs contenido publicado.
