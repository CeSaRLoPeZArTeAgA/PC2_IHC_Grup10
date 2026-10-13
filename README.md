# TriageVoz Rural — PC2 CC451 IHC

**Proyecto académico** de pre-triaje asistido por voz y silueta corporal para postas de salud rurales.

**Autores:** César Omar López Arteaga · Universidad Nacional de Ingeniería · CC451 · 2026-II.

## Instalación

Requiere **Node.js 20 o superior**.

1. Clonar este repositorio.
2. Ejecutar `npm start`.
3. Abrir `http://127.0.0.1:4173`.
4. Ejecutar pruebas con `npm test`.

## Recorrido de demostración

1. Seleccionar idioma y accesibilidad (la opción quechua solo se simula).
2. Comenzar como paciente; escoger la región del cuerpo en la silueta o escribir/dictar la molestia.
3. Confirmar explícitamente la región corporal y responder las preguntas de entrevista.
4. Revisar la información, generar resumen de datos declarados y enviar caso ficticio.
5. Copiar el código de caso, abrir el rol «Médico remoto (demo)», consultar caso, confirmar recepción y responder.
6. Volver al paciente y comprobar el estado de recepción.

La voz usa Web Speech API cuando el navegador es compatible. La alternativa textual siempre está disponible; puede operar sin permisos de micrófono. Las preferencias de accesibilidad se conservan localmente. Los casos ficticios persisten en JSON en el equipo.

## LLM opcional

El servidor contiene un adaptador para Gemini; nunca poner claves en archivos subidos a GitHub.

PowerShell: `$env:GEMINI_API_KEY="TU_CLAVE"; $env:GEMINI_MODEL="gemini-2.5-flash"; npm start`

Sin clave se muestra un resumen **determinista simulado**. El modelo objetivo mencionado en LEC06 no se declara disponible sin verificarlo.

## Contenido

- `server.mjs`: servidor Node y API simulada de casos.
- `public/`: PWA, estilos y tres propuestas de interfaz.
- `docs/`: PACT, stakeholders, historias, trazabilidad, C4, Gantt, navegación, criterios y límites.
- `tests/`: pruebas automáticas básicas.
- `data/`: datos ficticios para demostración.
- `LICENSE`: MIT.

**Estado de entrega:** código, documentación académica en **Word y PDF**, informe de aporte personal, capturas de la simulación, tres alternativas de diseño, diagramas C4/Gantt, fuentes LEC06 y LEC07. Consulta el [índice de evidencias de la PC2](docs/00-ENTREGA-PC2.md).

## Seguridad

El servidor solo escucha en 127.0.0.1. Los códigos de caso y la simulación de roles NO constituyen autenticación ni autorización clínica. No cargar nombres, imágenes, síntomas ni historiales de personas reales.
