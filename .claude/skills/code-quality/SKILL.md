---
name: code-quality
description: Criterios para decidir si el código de la práctica está bien o mal (errores, casos sin controlar, seguridad y claridad). Úsala siempre que se revise el código de src/ o public/ de este proyecto.
---

# Criterios de revisión de código

## 1. Que funcione de verdad

- Errores de lógica: condiciones al revés, límites mal puestos (por ejemplo `<` en lugar de `<=`), valores por defecto incorrectos.
- Casos sin controlar: id que no es un número, cuerpo vacío o con tipos erróneos, parámetros de consulta repetidos o mal formados, listas vacías.
- Efectos laterales: funciones que modifican datos compartidos sin querer (por ejemplo devolver el objeto original del almacenamiento en lugar de una copia).

## 2. Errores y respuestas HTTP

- El código de estado es el adecuado: 200, 201, 204, 400, 404 o 500. Nunca un 200 con un cuerpo de error.
- Todo error responde JSON y no revela trazas ni detalles internos.
- Una petición mala no puede parar el servidor.

## 3. Seguridad básica

- El servidor valida todo lo que llega; no se fía del cliente.
- Los campos desconocidos no se guardan y el `id` enviado por el cliente se ignora.
- En el navegador, los datos del servidor o del usuario se escriben con `textContent`, no con `innerHTML`.

## 4. Claridad y mantenimiento

- Cada módulo hace una sola cosa (rutas, controlador, validación, datos).
- No hay código duplicado ni código muerto o sin usar.
- Los nombres se entienden y las funciones no son demasiado largas.
- Los comentarios explican el porqué, no repiten el código.

## 5. Cliente (public/)

- Las peticiones comprueban `response.ok`.
- Se ven los estados de carga, error y lista vacía.
- Los campos del formulario tienen `label`, las imágenes tienen `alt` y el foco del teclado es visible.

## Gravedad

- GRAVE: falla o se puede romper con una petición normal.
- MEDIO: falla en un caso poco frecuente o es un riesgo real.
- LEVE: mejora de claridad o de estilo.
