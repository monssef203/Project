# Deployment

This project is ready to deploy the React/Vite client to GitHub Pages.

## GitHub Pages URL

After deployment, the static client will be available at:

https://monssef203.github.io/Project/

## Important permission note

I prepared the GitHub Pages workflow as a template at:

`deployment/github-pages-workflow.yml.example`

The current GitHub connection in this sandbox is not allowed to push files directly into `.github/workflows/`, so you must copy this template in GitHub after merging/pushing:

1. Create this file in the repository: `.github/workflows/deploy-client.yml`
2. Paste the contents from `deployment/github-pages-workflow.yml.example`
3. Go to **Settings** → **Pages**
4. Under **Build and deployment**, set **Source** to **GitHub Actions**
5. Run the workflow named **Deploy client to GitHub Pages** or push to `main`

## What the workflow does

- Installs dependencies with `npm ci` inside `client/`
- Builds with Vite
- Uses `VITE_BASE_PATH=/Project/` so assets and routes work under the GitHub Pages repository path
- Copies `dist/index.html` to `dist/404.html` so React Router pages can be refreshed
- Publishes `client/dist` to GitHub Pages

## Local production build

```bash
cd client
VITE_BASE_PATH=/Project/ npm run build
```

The output is generated in `client/dist/`.

## Important note about the backend

GitHub Pages only hosts static files. This app also has an Express API in `server/`, so product loading, login, checkout, and admin features need a deployed backend URL.

For a full production deployment, deploy `server/` to a Node host such as Render, Railway, Fly.io, or a VPS, then update the client API base URL to point to that backend.
