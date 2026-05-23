## Project overview (Poolcrest)

This overview summarizes the backend (be/) and frontend (fe/) implementations. I scanned only be/ and fe/ as requested (skipping node_modules, package-lock.json, public, env/venv, .vscode, .vite, .next, lib/Lib, diagrams, and docs).

### Quick facts

- Backend: Django REST Framework (custom apps under `be/apps/`)
- Frontend: React (Vite) under `fe/` with Tailwind CSS
- Auth: JWT via `djangorestframework-simplejwt` + custom session tracking
- DB: PostgreSQL preferred (local Docker or Supabase) with SQLite fallback for development
- Cache/Session: Redis when available, locmem fallback otherwise

---

## High-level backend architecture (be/)

Structure: `be/` is a Django project with `core` settings and multiple local apps under `be/apps/`.

Important files & responsibilities:

- `be/core/settings.py` — application configuration: INSTALLED_APPS, REST framework, JWT (SIMPLE_JWT), CORS, static/media, logging fallback, health check function.
- `be/config/database.py` — DB discovery/fallback: prefer local Docker Postgres, fall back to Supabase cloud, raises if no DB found in production. Also provides `check_database_health()` used by settings.
- `be/config/redis_config.py` (imported from settings when available) — Redis cache/session configuration.
- `be/manage.py`, `be/core/urls.py`, `be/core/wsgi.py`, `be/core/asgi.py` — standard Django entry points and URL routing.

Local Django apps (brief):

- `apps.users` — custom `User` (UUID primary key) and `UserProfile`, detailed auth & session tracking, password-reset tokens, admin helpers, extensive serializers, views and routers under `/api/users/` and auth endpoints under `/api/users/auth/` (login/register/logout/password-reset/etc.). Implements custom managers, signal helpers and security logging hooks.
- `apps.services` — Service catalog (models, CRUD API) with endpoints: `/api/services/` and extra actions (categories, popular, seasonal, statistics, toggle/duplicate).
- `apps.properties` — Customer properties (pool info), photos, notes, service areas. Endpoints under `/api/properties/` via DRF router. Custom actions: `my_properties`, `upload_photo`, `add_note`, `service_history`, `bulk_action`, `set_primary`, and statistics/service-area helpers.
- `apps.quotes` — Robust quote system: `Quote`, `QuoteItem`, `Promotion`. APIs include creation (customer-initiated), staff processing, send-to-customer, confirm/reject, apply promotion, bulk actions and statistics (/api/quotes/ and /api/promotions/).
- `apps.appointments` — Scheduling model & APIs (appointments, recurring generation, check-ins, technician scheduling, calendar views).

Routing: `core/urls.py` includes app routers:

- `/api/users/` (users + auth)
- `/api/` includes services, properties, appointments, quotes routers as subpaths (each app registers its own endpoints)

Security & auth notes:

- JWT tokens via `rest_framework_simplejwt`. Access/Refresh lifetimes configurable via environment.
- Token blacklisting is enabled (`token_blacklist`) and logout view blacklists refresh token when provided.
- Custom session tracking stored in `UserSession` model; frontend stores `session_key` and includes it in requests (FE uses it for logout and session validation).
- Account lockout & failed-login tracking exist on the `User` model with helpers to lock/unlock.

Data & operations:

- Database: Postgres in production; settings attempt to connect to Docker Postgres first, then Supabase. SQLite used as fallback for development.
- Redis: optional; used for caching and sessions when available. If missing, code falls back to locmem caches.
- Logging: custom logging modules exist under `be/config/` with file rotation; settings use `setup_logging()` when available.

Developer utilities & maintenance scripts:

- `be/manage_db.py`, `be/manage_static.py`, `be/quick_setup.py`, and many guided scripts and `bugs_problems_solutions/` helper scripts for emergency fixes and migrations.

---

## High-level frontend architecture (fe/)

Structure: React app (Vite) under `fe/` with `src/` containing pages, components, contexts and utilities.

Important files & responsibilities:

- `fe/src/index.jsx` — app bootstrapping
- `fe/src/App.jsx` — top-level App wrapper providing `DjangoAuthProvider` context
- `fe/src/Routes.jsx` — React Router tree for public and protected pages (homepage, services, plans, about, auth, quotes, properties)
- `fe/src/contexts/DjangoAuthContext.jsx` — authentication context (consumes `fe/src/utils/djangoAuthService.js`)
- `fe/src/utils/api.js` & `fe/src/utils/tokenManager` (not read exhaustively here) — centralized API client and token storage
- `fe/src/utils/djangoAuthService.js` — authentication helper that calls backend endpoints (login: `/users/auth/login/`, register: `/users/auth/register/`, logout: `/users/auth/logout/`, password reset endpoints, profile get/patch).

FE patterns:

- ProtectedRoute wrapper for auth-required pages.
- LocalStorage used to cache `user_profile` and `session_key`; tokenManager stores JWT tokens.
- Components and pages include Quote examples, Services, Maintenance Plans, and many UX helpers.

API surface used by FE:

- Authentication: POST `/users/auth/login/`, POST `/users/auth/register/`, POST `/users/auth/logout/`, GET `/users/auth/validate/`, password reset endpoints.
- Users/Profiles: `/api/users/` (router created by DRF in backend)
- Services: `/api/services/`
- Properties: `/api/properties/` (list, detail, create, patch, delete) + `/my_properties/`
- Quotes: `/api/quotes/` and `/api/promotions/`
- Appointments: `/api/appointments/`

---

## Key endpoints (summary)

- Auth: POST /api/users/auth/login/ POST /api/users/auth/register/ POST /api/users/auth/logout/ POST /api/users/auth/refresh/ GET /api/users/auth/validate/
- Users: `/api/users/users/` (ModelViewSet via router) + `/api/users/profiles/` (profile endpoints and actions)
- Services: `/api/services/` (+ /categories, /popular, /seasonal, /statistics)
- Properties: `/api/properties/` (photos, notes, my_properties, statistics)
- Quotes: `/api/quotes/` (create/process/send/confirm/reject/apply_promotion/duplicate/bulk_action/statistics)
- Appointments: `/api/appointments/` (confirm/cancel/reschedule/start/complete/check_in/check_out/calendar/technician_schedule)

Note: exact URL prefixes are declared by each app's router; consult the app `urls.py` files for precise routes.

---

## Operational & security notes (high-value issues observed)

1. Secrets and env: `core/settings.py` loads `.env`. Ensure production secrets (SECRET_KEY, DB and JWT secrets, SUPABASE keys, STRIPE/TWILIO) are stored securely and not checked into git.
2. Database fallback: settings attempt local Docker Postgres, then Supabase — in production this should fail fast (it does when APP_ENV=production). Confirm environment is set correctly.
3. Redis optional: code tries to ping Redis at startup and switches caches/sessions. Ensure Redis availability in production if session caching is desired.
4. Token blacklist: logout blacklists a provided refresh token, but the FE must reliably send the refresh token on logout for the blacklist to work.
5. Session tracking: `UserSession` is used widely — ensure FE includes session key where required (the FE stores it on login). Consider a middleware to validate session_key on each request.
6. Rate limiting & throttles are configured in settings; adjust rates for production traffic.
7. Logging: custom logging exists; review handlers to avoid logging sensitive data (tokens/passwords).

---

## Suggested next steps (low-risk, high-value)

- Add an automated healthcheck endpoint that calls `core.settings.HEALTH_CHECK()` and returns JSON (if not already exposed).
- Ensure `.env` is excluded from git and add a secure secret management plan for production.
- Add an integration test for the auth flow (register -> login -> validate -> logout) to verify token blacklist + session cleanup.
- Confirm FE sends refresh token on logout and passes session_key in requests that require session validation.
- Add a short README in `be/` and `fe/` with quick run instructions (venv, env vars, docker-compose command).

---

## Assumptions made while creating this summary

- I treated the repository root as `Poolcrest` (user wrote `Poolcest`); the file `OVERVIEW.md` was created in `Poolcrest` root.
- I skipped directories you requested (diagrams, docs) and common ignored folders as instructed.

---

## Requirements coverage

- Read and summarize `be/` and `fe/` folders (excluding specified ignore patterns): Done — read core settings, database config, users, services, properties, quotes, appointments, and key frontend files.
- Produce `OVERVIEW.md` in project root: Done (this file).

If you want, I can now:

- expand any section into a more detailed architecture diagram or sequence flows (auth, quote lifecycle, appointment scheduling),
- create a `HEALTHCHECK` endpoint and add minimal tests for auth flows,
- or generate a short `RUNNING.md` with startup commands for development (Windows PowerShell friendly).

---

Generated on: 2025-08-26

---

## Why add a Properties index page?

- Navigability: Previously, visiting `/properties` produced a 404. Adding an index page (`PropertiesList`) gives users a place to view and manage their properties, matching the CRUD flow you expect.
- Consistency: Quotes already have list, create, and detail routes. Properties now match that pattern (`/properties`, `/properties/create`, `/properties/:id`).
- Deep links: Other pages (e.g., quote creation) can link users back to their properties list cleanly.
