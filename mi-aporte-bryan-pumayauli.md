# Mi aporte personal — PC2 CC451

> **Integrantes, Grupo 10 — CC451 PC2:** Santa Cruz Basilio, Jesus Diego — 20235005G | López Arteaga, César Omar — 20236743A | Pumayauli Evangelista, Bryan José — 20212209E.

**Pumayauli Evangelista, Bryan José · 20212209E · Grupo 10**  
**Curso:** CC451 Interacción Humano-Computador — Práctica Calificada 02  
**Fecha:** 14 de octubre de 2026  
**Proyecto:** TriageVoz Rural — Interfaz no convencional para pre-triaje asistido por voz y silueta interactiva (PWA)

---

## 1. Dominio y Requerimientos Asignados

En esta iteración del proyecto **TriageVoz Rural**, mi trabajo individual se enfocó en dos componentes esenciales de Interacción Humano-Computador (IHC):

1. **Rediseño e implementación de la Silueta Anatómica Interactiva Bidireccional (Frente y Espalda):**
   - **Mapeo Natural y Correspondencia Anatómica (Don Norman):** La versión inicial solo contaba con una vista anterior (frente), lo que impedía que pacientes rurales con afecciones comunes (lumbalgia, contracturas en nuca o dolores dorsales) pudieran indicar su molestia de forma intuitiva.
   - Diseñé e implementé la **vista dual Frente/Espalda** con pestañas de cambio rápido (`👤 Frente` y `🔄 Espalda`), siluetas SVG anatómicas independientes y **detección semántica automática**: al escribir o dictar por voz palabras como *"espalda"*, *"lumbar"*, *"nuca"* o *"glúteos"*, la interfaz conmuta automáticamente a la vista posterior.

2. **Diseño e implementación de «Multiusuario: con salas, compartición o colaboración» (RF-19):**
   - Transformé la metáfora de códigos alfanuméricos aislados de 12 caracteres (que operaban como tickets fríos de encomienda) hacia el concepto de **Salas de Teleconsulta Rural Compartidas** (`SALA-...`).
   - Implementé una **bandeja de salas activas en espera** con acceso directo a **un solo clic**, eliminando la necesidad de memorizar o transcribir códigos (reduciendo la sobrecarga de memoria de trabajo y el Golfo de Ejecución).
   - Desarrollé la conciencia compartida (*Workspace Awareness* en CSCW) para que el paciente y la posta visualicen en vivo cuando el médico remoto confirma recepción y emite indicaciones.

3. **Garantía de completitud en datos clínicos simulados:**
   - Enriquecí el catálogo de casos en `data/casos-ficticios.json` y `data/runtime.json` con 6 postas rurales peruanas, garantizando cobertura de diversas regiones (lumbar, tórax, cabeza, pierna, abdomen, brazo) con los 6 atributos clínicos completos (Zona, Relato, Inicio, Intensidad, Adicionales y Resumen).

---

## 2. Aporte Técnico y de Diseño en el Repositorio

### A. Silueta Corporal Interactiva Bidireccional (`public/index.html`, `public/app.js`, `public/styles.css`)
* **Componente de selector de vistas (`.bodymap-tabs`):** Pestañas con iconografía y texto claro (`#tabFront` y `#tabBack`), soporte táctil amplio (Ley de Fitts) y etiquetas de accesibilidad ARIA (`role="tab"`, `aria-selected`).
* **Vistas SVG diferenciadas (`#frontView` y `#backView`):**
  * *Vista Frontal:* Cabeza, Tórax, Abdomen, Brazos y Piernas.
  * *Vista Posterior (Espalda):* Nuca/Cuello, Espalda alta, Espalda baja (lumbar), Glúteos, Brazos y Piernas posteriores.
* **Conmutación contextual inteligente (`switchView`):** Detección reactiva de términos corporales en la entrada de voz o texto que rota la silueta a la vista correspondiente sin intervención manual del usuario.
* **Interactividad y Accesibilidad:** Estados visuales `hover`, foco por teclado (`focus-visible` con borde resaltado) y selección (`.selected` con relleno teal `#006c83`), compatible con el modo de Alto Contraste (`body.high`).

### B. Módulo Multiusuario y Salas Colaborativas (`public/`, `server.mjs`)
* **Bandeja de Salas Activas (`#roomList`):** Panel interactivo en la pestaña del médico remoto que muestra en tiempo real las salas en espera con badges de estado (`🟡 En espera de médico` vs. `🟢 Atendido / Recibido`).
* **Selección a 1 clic:** Acceso inmediato a la sala sin copiar ni pegar códigos hexadecimales.
* **Backend y API REST (`server.mjs`):** Endpoint `GET /api/rooms`, normalización tolerante al prefijo `SALA-` en `byCode` y persistencia atómica en `runtime.json`.
* **Sincronización en tiempo real:** Retroalimentación inmediata en la pantalla del paciente informando la confirmación de recepción y mostrando las respuestas del médico.

### C. Catálogo Completo de Datos Clínicos Ficticios (`data/`)
* Poblamiento integral de 6 postas rurales (Huancavelica, Cajatambo, Andahuaylas, Paucartambo, Yauyos, Chumbivilcas) con historias clínicas completas y balanceadas en todas las zonas corporales.

### D. Calidad y Pruebas Automatizadas (`tests/app.test.mjs`)
* Implementación de pruebas automatizadas para silueta bidireccional y salas colaborativas (test 5 y test 7). Suite con 12 pruebas pasando al 100% (`12 pass, 0 fail`) y validación en GitHub Actions (`✓ 1/1`).
* Actualización de la matriz de trazabilidad (`docs/05-trazabilidad.csv`) y checklist de entrega (`docs/10-checklist-PC2.md`).

---

## 3. Evidencias Verificables en el Repositorio

| Artefacto / Archivo | Módulo / Tipo | Aporte Específico Verificable |
|---|---|---|
| `public/index.html` | Frontend / UI | Silueta dual SVG (#frontView y #backView), pestañas Frente/Espalda (#tabFront, #tabBack) y bandeja de salas activas (#roomList). |
| `public/app.js` | Lógica IHC | Función `switchView()`, conmutación semántica por palabras clave (espalda, lumbar, nuca, etc.), función `loadRooms()` y navegación a 1 clic. |
| `public/styles.css` | Diseño / CSS | Estilos de pestañas (.bodymap-tabs), silueta dorsal, cuadrícula de salas (.room-grid) y compatibilidad body.high. |
| `server.mjs` | Backend / API | Endpoint `GET /api/rooms`, auto-siembra de 6 postas y soporte de prefijo `SALA-`. |
| `data/casos-ficticios.json` | Datos simulados | Catálogo de 6 postas rurales con datos 100% completos en todas las regiones corporales. |
| `data/runtime.json` | Persistencia | Salas activas y atendidas con respuestas médicas simuladas, sin registros vacíos. |
| `tests/app.test.mjs` | Pruebas automáticas | Tests unitarios para silueta anterior/posterior (test 5) y salas colaborativas (test 7); 12/12 pruebas en verde. |
| `docs/05-trazabilidad.csv` | Trazabilidad | Trazabilidad de `RF-04: Silueta corporal táctil` y `RF-19: Multiusuario con salas colaborativas`. |
| `docs/10-checklist-PC2.md` | Documentación | Registro del cumplimiento de silueta integrada y salas multiusuario. |
| GitHub Commits | Control de versiones | Commits firmados por `pumayauli` con integración continua aprobada (`✓ 1/1`). |

---

