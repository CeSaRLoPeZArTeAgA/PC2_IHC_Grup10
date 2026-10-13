# Arquitectura C4 — TriageVoz Rural (prototipo)

## C1: Contexto

```mermaid
flowchart LR
 P[Paciente ficticio] --> PWA[PWA TriageVoz Rural]
 T[Técnico de posta] --> PWA
 M[Médico remoto - rol simulado] --> PWA
 PWA --> L[Proveedor LLM remoto opcional]
```

## C2: Contenedores

```mermaid
flowchart LR
 B[Navegador PWA] -->|HTTP local| S[Servidor Node.js]
 S --> J[JSON casos ficticios]
 S -->|HTTPS con API key solo servidor| G[Gemini opcional]
```

## C3: Componentes

Frontend: preferencias, Web Speech API, silueta corporal, entrevista, confirmación, seguimiento. Backend: rutas REST, validador/sanitizador, adaptador LLM con fallback determinista y persistencia local.

La aplicación es demostrativa: la API de casos no tiene RBAC clínico, cifrado de registros ni consentimiento sanitario real.
