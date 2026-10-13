# Plan de pruebas de la PWA

> **Integrantes, Grupo 10 — CC451 PC2:** Santa Cruz Basilio, Jesus Diego — 20235005G | López Arteaga, César Omar — 20236743A | Pumayauli Evangelista, Bryan José — 20212209E.

Probar con Node.js 20+ y un navegador Chromium o Edge.

| ID | Prueba | Criterio esperado |
|---|---|---|
| P-01 | GET /api/health | HTTP 200 y ok:true |
| P-02 | GET / y recursos PWA | HTML, JS, CSS, manifest y service worker |
| P-03 | Zona con silueta/texto | Zona visible y confirmable |
| P-04 | Voz no disponible | Permite escribir sin perder información |
| P-05 | Entrevista y revisión | Cuatro respuestas editables |
| P-06 | POST /api/llm sin API key | Resumen simulado con aviso |
| P-07 | POST /api/cases sin motivo ni zona | HTTP 422 |
| P-08 | Enviar, consultar, acusar recepción | Cambia de enviado a recibido solo tras /ack |
| P-09 | Responder como médico de demo | Respuesta identificada como profesional simulado |
| P-10 | Contraste y tamaño | Preferencias conservadas al recargar |
| P-11 | Desconexión durante envío | No comunica recepción; conserva borrador local |
| P-12 | Datos no reales | Verificación manual de pruebas únicamente con ficticios |

No afirmar que estas pruebas corresponden a validación con pacientes ni a validación clínica.
