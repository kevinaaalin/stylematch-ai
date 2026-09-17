# Independent website deployment: API origin and development-identity boundary

2026-09-17. Implemented/deployed locally, not a public production launch.

The website does not acquire AWOS approval to start. Its existing analysis, proposal and API clients remain separate from AWOS 4310. No governance review rules were removed.

`src/lib/deploymentConfig.js` now supplies the API origin for image tasks, AI Generate, StructuredSpace, style-result delivery and iSAFE handoff. Loopback pages default to 127.0.0.1:4180. Public HTTPS pages default to their own origin; `VITE_ISAFE_API_ORIGIN` may name a HTTPS origin without paths, credentials, query or fragment. Production deployments should reverse-proxy `/api/v1` to the business API or configure that origin with appropriate CORS. The API is not bundled into the static website.

Development identity is permitted only when BOTH the page and API are loopback. The old VITE_ISAFE_LOCAL_TOKEN browser override is removed; do not place secrets in VITE variables. Public/remote authenticated operations deliberately fail closed until real server-authenticated identity and tenant/role enforcement are implemented. This does not itself provide production authentication or harden the separate API server. Never expose the existing local development API directly to the internet.

Validation: 24 local scripts including origin-negative tests and the real exported token guard; TypeScript, targeted ESLint and Vite production build passed (existing >500 kB bundle warning remains). Chrome loaded the local website. The paired iSAFE browser loaded actual local API case data. No AWOS or business API restart, DNS change, public exposure or production database write was performed.

Remaining production gates: backend authentication/authorization and CSRF/session model, managed database and media storage, HTTPS/proxy/CORS, secret management, backups/restore, provider availability/quotas, and end-to-end tests on the chosen hosting environment. Browser-only project storage is not a shared cloud database. Image quality and complete proposal delivery remain separate acceptance scopes.
