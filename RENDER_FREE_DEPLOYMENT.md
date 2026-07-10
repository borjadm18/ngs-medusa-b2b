# Render Free Deployment - NGS Medusa B2B

This repo includes `render.yaml` for a free-tier Render lab deployment:

- Web service: `ngs-medusa-backend`
- PostgreSQL: `ngs-medusa-postgres`
- Key Value/Redis: `ngs-medusa-redis`
- Backend health: `/health`
- Admin: `/app`

## Important free-tier caveats

- Free web services can spin down after inactivity.
- Free PostgreSQL is for trials/labs and should not be treated as persistent production storage.
- First requests after inactivity can be slow.

## Required Git setup

Render Blueprints must read `render.yaml` from a Git provider repository.

Create a GitHub repository owned by the project, then push this repo:

```powershell
git remote rename origin upstream
git remote add origin https://github.com/<owner>/ngs-medusa-b2b.git
git push -u origin main
```

## Apply the Blueprint

Open:

```text
https://dashboard.render.com/blueprint/new?repo=https://github.com/<owner>/ngs-medusa-b2b
```

Render will provision the backend, Postgres, and Key Value service from `render.yaml`.

## After first deploy

1. Open the backend health endpoint:

```text
https://ngs-medusa-backend.onrender.com/health
```

2. Open the Admin:

```text
https://ngs-medusa-backend.onrender.com/app
```

3. Create or verify the admin user if needed:

```powershell
cd apps/backend
pnpm medusa user -e admin@test.com -p supersecret
```

4. Update the storefront environment:

```text
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://ngs-medusa-backend.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<publishable-key-from-medusa>
```

5. Update Render CORS env vars if the storefront URL changes:

```text
STORE_CORS=<storefront-url>
ADMIN_CORS=https://ngs-medusa-backend.onrender.com
AUTH_CORS=https://ngs-medusa-backend.onrender.com
```
