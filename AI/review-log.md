# Registro de revisión de los agentes

Cada fila es una aportación relevante de un agente: qué se pidió, qué devolvió, qué se comprobó y por qué se aceptó, se corrigió o se rechazó. Fecha de todas las entradas: 2026-11-02.

| Fecha | Aportación solicitada | Resultado del agente | Revisión realizada | Decisión y motivo |
|---|---|---|---|---|
| 2026-11-02 | Tester: probar la API como caja negra usando solo el README y escribir pruebas en `tests/` | 67 pruebas en `tests/health.test.js` y `tests/asignaturas.test.js` (`node:test` y `fetch`); el agente las ejecutó y pasaron 67 de 67 | Se ejecutaron en local con `node --test tests/*.test.js`: 67 de 67 | Aceptadas tal cual |
| 2026-11-02 | Tester: ejecutar con `npm test` | `npm test` falla en Node 24 («Cannot find module») porque el script era `node --test tests/`; el agente propone `node --test tests/*.test.js` y no lo cambia | Se reprodujo el fallo | Corregido por el equipo en `package.json`; ahora `npm test` da 67 de 67 |
| 2026-11-02 | Tester: puntos del README que tuvo que interpretar | Orden por `nombre` con tildes («Cálculo» después de «Computación»), tipos estrictos (`"6"` y `"true"` dan 400) y el 500, que no se puede probar desde fuera | Se contrastó con el hallazgo del reviewer sobre la ordenación | Tipos estrictos: aceptado. Orden con tildes: limitación anotada (ver R-02). 500: sin prueba |
| 2026-11-02 | Comprobar que las pruebas no pasan siempre: se cambió a propósito el `POST` para que devolviera 200 en vez de 201 | Fallaron 3 de las 67 pruebas (`200 !== 201`) | Se revirtió el cambio y volvieron a pasar las 67 | Aceptado: las pruebas detectan errores reales |
| 2026-11-02 | Code reviewer: revisar `src/` y `public/` con la skill `code-quality` | GRAVE: el asistente muestra la pregunta en lugar de la respuesta (`asistente.js:146`) | Se releyó el código y se reprodujo | Aceptado y corregido en `public/asistente.js` |
| 2026-11-02 | Code reviewer | MEDIO: la ordenación con `<`/`>` deja «Álgebra» y «Ética…» al final | Coincide con la observación del tester | Real, no corregido en esta entrega; mejora pendiente con `localeCompare` |
| 2026-11-02 | Code reviewer | MEDIO: la consulta del buscador no se codifica («I&D» da 400, «C++» y «#» fallan) | Se releyó el código: es real | Real, no corregido en esta entrega; mejora pendiente con `encodeURIComponent` |
| 2026-11-02 | Code reviewer | MEDIO: respuestas tardías del buscador pueden sobrescribir las nuevas | Real según el código | Real, no corregido en esta entrega; mejora pendiente |
| 2026-11-02 | Code reviewer | MEDIO: errores del cliente como 413 o 415 devuelven 500; el agente avisó de que no lo había ejecutado | Se probó: un cuerpo grande devuelve 500 en vez de 413 (cierto); una cabecera con charset devuelve 400, no 415 (falso) | 413: real, no corregido en esta entrega. 415: rechazado por no ser cierto |
| 2026-11-02 | Code reviewer | LEVE: código sin usar, duplicaciones, `className = 'acciones'` que falta, comentario del aviso incorrecto, etc. | Sin comprobar uno a uno | Anotados; no se aplican en esta entrega |
| 2026-11-02 | Code reviewer | LEVE: texto «Autores: Nombre Apellidos…» en `asignaturas.html` y menú distinto en cada página | Pendiente de comprobar en el repositorio | A corregir antes de entregar (nombres reales) |

**Por qué solo se corrigió el hallazgo grave.** El equipo decidió aplicar solo la corrección del GRAVE porque rompía una función visible del asistente. Los demás son casos límite o mejoras de calidad que no afectan a lo que pide el enunciado, y el equipo prefiere mantener el código simple y explicable. Quedan anotados aquí como mejoras conocidas.
