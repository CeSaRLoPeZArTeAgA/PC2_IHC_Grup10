# Mi aporte personal — PC2 CC451

> **Integrantes, Grupo 10 — CC451 PC2:** Santa Cruz Basilio, Jesus Diego — 20235005G | López Arteaga, César Omar — 20215508C | Pumayauli Evangelista, Bryan José — 20212209E.

**Santa Cruz Basilio, Jesus Diego · 20235005G · Grupo 10**  
**Curso:** CC451 Interacción Humano-Computador — Práctica Calificada 02  
**Fecha:** 14 de octubre de 2026  

---

## 1. Aporte documentado en esta versión del repositorio

En esta iteración del proyecto **TriageVoz Rural**, mi trabajo se ha enfocado en el diseño e implementación de la **Personalización Continua** y el **Diseño de Interacción Adaptativo** en el frontend, cumpliendo con los requerimientos obligatorios de la PC2:

1. **Diseño e implementación de personalización continua por ritmo de usuario (> 10 seg/pregunta):**
   - Incorporé el cronometraje activo por pregunta (`questionStartTime` y temporizador reactivo a los 10 segundos en la entrevista guiada).
   - Detección automática del ritmo pausado (`rhythm: 'pausado'`) cuando el paciente tarda más de 10 segundos en contestar.
   - Adaptación en tiempo real de la velocidad de síntesis de voz (`SpeechSynthesisUtterance.rate = 0.82`) para ofrecer una dicción más calmada y comprensible para usuarios rurales o con baja alfabetización digital.
   - Activación de retroalimentación contextual (`#rhythmHint`) y micro-interacción de atención con animación pulsante en el botón *"Explicar más fácil"*.
   - Persistencia del perfil adaptativo y tiempos promedio de respuesta en `localStorage` (`triagevoz_user_profile`).

2. **Detección de fricción cognitiva y manejo proactivo de errores (Umbral $\ge 2$):**
   - Creación del sistema de registro de correcciones y fallas (`recordCorrection`), capturando:
     - Intentos de avanzar sin seleccionar zona corporal en la silueta.
     - Clic en *"No, corregir"* tras la confirmación de la zona interpretada.
     - Envíos de campos vacíos en la entrevista guiada.
     - Retrocesos hacia preguntas previas (`← Anterior`).
     - Reingresos a edición de respuestas desde la pantalla de revisión final.
     - Errores y cancelaciones en el dictado por voz de la Web Speech API.
   - Despliegue proactivo del banner de accesibilidad (`#adaptiveBanner`) al alcanzar $\ge 2$ correcciones, ofreciendo ayudas con un solo clic:
     -  Activación de lectura por voz.
     -  Aumento de tamaño de letra (texto grande).
     -  Simplificación automática del lenguaje de las preguntas.

3. **Componente de perfil adaptativo en vivo (`#profileCard`):**
   - Implementación de la tarjeta superior con soporte de accesibilidad (`aria-live="polite"`), comunicando en tiempo real el ritmo (`Normal ≤10s` vs. `Pausado >10s`), el conteo de correcciones y el estado de adaptación del sistema.