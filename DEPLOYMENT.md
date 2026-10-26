# Deployment notes

## Recommended architecture
- Frontend: deploy `frontend/` to a Next.js-capable host.
- Backend: deploy `backend/` to a persistent Node.js service/container with outbound HTTPS and a private persistent disk mounted at `WHATSAPP_AUTH_DIR`.
- Database: PostgreSQL for application metadata; the current WhatsApp auth state uses a private persistent directory.

## Environment
Backend: copy `.env.example`; set `NODE_ENV=production`, a strong random `AUTH_SECRET` (32+ random bytes), unique admin credentials, `APP_URL`, exact `FRONTEND_ORIGIN`, and `WHATSAPP_AUTH_DIR` pointing to a persistent private volume. Set `DATABASE_URL` if using Prisma metadata. Never put backend secrets in `NEXT_PUBLIC_*` variables.

Frontend: set `NEXT_PUBLIC_API_BASE_URL` to the HTTPS backend URL. Redeploy after changing it.

## Free hosting caveat
Many free tiers sleep, recycle containers, restrict long-running processes, or lack persistent storage. A WhatsApp socket generally needs a continuously running process and persistent auth state. If the provider sleeps or deletes disk data, the bot may disconnect or require relinking. Do not promise 24/7 availability unless the provider explicitly supports it. Use a low-cost always-on VPS/container with persistent disk if reliability is required.

## HTTPS and domains
Use provider-managed TLS for both frontend and backend. Set `FRONTEND_ORIGIN` to the exact frontend origin (scheme + host, no path). Use secure cookies in production. Do not expose the auth directory as a static directory.

## Security checklist before public launch
- Replace bootstrap admin login with database-backed user accounts, forced password change, and account recovery.
- Add persistent rate limiting (e.g. Redis), CSRF strategy appropriate to deployment, login lockout, audit log persistence, and monitoring.
- Encrypt auth-state files at rest and tightly restrict disk permissions/backups.
- Add a worker registry/lease to prevent duplicate sockets, and isolate auth state per authorized user.
- Wire `messages.upsert` to `handleIncomingMessage` after reviewing privacy/consent requirements.
- Add reconnect/backoff and restore logic, health checks, structured event persistence, tests against a real WhatsApp test account, and alerting.
- Do not log pairing codes, credentials, message bodies, cookies, or tokens.

## Troubleshooting
- `401 Authentication required`: sign in at `/login`; ensure browser and backend share the expected origin and credentials are included.
- CORS/origin error: align `FRONTEND_ORIGIN` with the exact browser origin.
- Pairing code not issued: verify international phone digits, backend outbound connectivity, library compatibility, and WhatsApp availability; wait before retrying.
- Session disappears after restart: mount a persistent disk and set `WHATSAPP_AUTH_DIR` to it. This baseline does not recreate a live socket automatically after restart.
- Free service sleeps: move the backend to a persistent process host.
