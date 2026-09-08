# Gemini Image Provider Migration (2026-08-27)

Status: Local Functional Acceptance Passed / Candidate Implementation. Production Ready: NO.

StyleMatchAI contains no legacy `imagen-*` or `ImagenModel` call. The cloud image adapter now uses a provider-neutral task contract with these routes:

- standard and high-volume work: `gemini-3.1-flash-image`
- high-quality proposal work: `gemini-3-pro-image`
- four reference images: four independent single-image calls
- cloud output: persisted locally with provider, model, SHA-256, MIME type and mandatory SynthID provenance
- panorama and offline generation: independent local ComfyUI workflow

The cloud adapter is enabled only when `GOOGLE_GENAI_API_KEY` is configured. Without a key the existing ComfyUI path remains the default, so the local website stays usable without network access. Set `AI_IMAGE_PROVIDER=google_gemini` to require cloud generation or `comfyui` to force the local provider.

The official Gemini image API supports PNG and JPEG. StyleMatchAI requests PNG for deterministic local storage; PNG is a product choice, not an API limitation. Cloud provider E2E remains pending until a real API key, billing account and cost/quality acceptance dataset are supplied.

Official references:

- https://ai.google.dev/gemini-api/docs/deprecations
- https://ai.google.dev/gemini-api/docs/image-generation
