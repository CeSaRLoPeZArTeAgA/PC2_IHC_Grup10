# APORTE PERSONAL — PC2 CC451

**Grupo 10 — Integrantes:**

- Santa Cruz Basilio, Jesus Diego — 20235005G
- López Arteaga, César Omar — 20215508C
- Pumayauli Evangelista, Bryan José — 20212209E

**Aporte personal registrado:** López Arteaga, César Omar — 20215508C.

## 1. Aporte personal documentado

- Consolidé los requerimientos de LEC06 (17 funcionales y 10 no funcionales) y sus 10 historias de usuario; amplié la matriz de trazabilidad con los criterios y requerimientos de PC2.
- Organicé el rediseño de LEC07 mediante tres alternativas navegables (A, B y C) y sustenté la selección de la interfaz multimodal integrada (C).
- Integré y verifiqué el flujo de la PWA TriageVoz Rural: selección corporal, entrevista por texto o voz, confirmación, resumen y envío de un caso ficticio.
- Probé la comunicación local entre los dos roles: consulta del caso desde la bandeja, confirmación de recepción, respuesta del médico simulado y lectura de la respuesta por el paciente.
- Organicé la documentación técnica y las evidencias del proyecto: informe PC2, matriz RF/RNF–HU, arquitectura C4, flujo de pantallas, guía de ejecución y pruebas.

## 2. Evidencia verificable de mi aporte

La documentación y los archivos que respaldan mi participación se encuentran en el repositorio del Grupo 10: `docs/01-informe-PC2.docx`, `docs/05-trazabilidad.csv`, `docs/02-arquitectura-C4.md`, `public/app.js`, `public/index.html`, `server.mjs` y `tests/`.

Ejecuté en mi computadora el flujo completo con el caso ficticio **SALA-555CEF76E974**: lo envié como paciente, comprobé su recepción en el rol médico, registré una respuesta y verifiqué que apareciera en la vista del paciente. Este recorrido quedó documentado mediante capturas manuales de la prueba.

Como verificación complementaria, el repositorio registra **12 pruebas automáticas aprobadas** y cinco capturas E2E de Chromium. El procedimiento y sus resultados están documentados en `docs/06-pruebas-y-evidencias.md` y `docs/15-evidencias-e2e.md`.

## 3. Mi contribución y alcance del resultado

Mi aporte consistió en estructurar los requisitos y la propuesta de interacción, integrar los entregables académicos y comprobar el funcionamiento del prototipo de extremo a extremo. Verifiqué que un caso pudiera registrarse, consultarse y recibir una respuesta visible, manteniendo la distinción entre «enviado» y «recibido».

Trabajé exclusivamente con casos ficticios. Presento estos resultados como evidencias de funcionamiento de un prototipo académico local, no como validación clínica, autenticación de médicos reales ni despliegue de telemedicina en producción.

## 4. Evidencias visuales de funcionamiento

Incorporé evidencias de la interfaz ejecutada durante el flujo paciente–médico–paciente. Las siguientes capturas del repositorio son verificaciones automatizadas en Chromium con **un caso ficticio distinto del SALA-555CEF76E974** que usé en mi prueba manual; no deben presentarse como capturas de la misma sesión.

- **Figura 1. Caso enviado:** [01-caso-enviado.png](assets/evidencias-integracion/01-caso-enviado.png). Verifiqué el registro y la generación de código ficticio.
- **Figura 2. Bandeja de casos:** [02-bandeja-casos.png](assets/evidencias-integracion/02-bandeja-casos.png). Comprobé la consulta de casos en el rol médico simulado.
- **Figura 3. Acuse e historial:** [03-confirmacion-historial.png](assets/evidencias-integracion/03-confirmacion-historial.png). Verifiqué recepción y conservación de la respuesta.
- **Figura 4. Respuesta al paciente:** [04-respuesta-paciente.png](assets/evidencias-integracion/04-respuesta-paciente.png). Comprobé que el paciente recupera y lee la respuesta.

Las imágenes originales y su procedimiento de obtención pueden revisarse en [el registro de evidencias E2E](docs/15-evidencias-e2e.md). Estas capturas muestran la funcionalidad del prototipo y complementan —sin sustituir— mi prueba manual.
