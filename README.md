# Brace + Prolit SPA example

This repository is an application-level example for a Brace backend and a TrunkJS Prolit frontend. Brace owns the HTTP/API side and the SPA shell; the browser application uses Prolit, the TrunkJS Router and TrunkJS Responsive.

## Structure

- `App.be/` — Brace bootstrap, modules, middleware, routes and backend source.
- `app.fe/` — Vite/TypeScript frontend, routed Prolit elements and generated API client.
- `www/index.php` — Apache/front-controller entrypoint only.

The frontend is intentionally separated from backend source. `App.be/bootstrap.php` changes Brace's application root so both the web entrypoint and `vendor/bin/brace` load the numbered files from `App.be/`.

## Frontend packages before publication

The current TrunkJS Prolit reorganization is not fully published yet. `app.fe/package.json` therefore installs the required packages directly from their package directories in `trunkjs/trunkjs-monorepo` through pnpm Git dependencies. Vite and TypeScript aliases point at those checked-out TypeScript entry files.

After the packages are published, replace the Git dependencies with normal semver versions and remove the temporary source aliases from `vite.config.ts` and `tsconfig.json`.

## Run the example

Install backend and frontend dependencies:

```bash
composer install
cd app.fe
pnpm install
```

Start Brace from the repository root:

```bash
php -S 127.0.0.1:8080 -t www www/index.php
```

Start Vite in a second terminal:

```bash
cd app.fe
pnpm dev
```

Open `http://127.0.0.1:4000/`. Vite is browser-facing in development and proxies `/api` plus SPA navigation to Brace.

## Typed API stub

`App.be/20_routes.php` registers the Brace route and `TypeScriptApiStubModule`. The generated client target is `app.fe/src/generated-api.ts`.

The stub is regenerated automatically when Vite starts and before a Vite build through `vite-plugin-run`. It can also be generated explicitly from the repository root:

```bash
vendor/bin/brace spa-api-build
```

The generated file is intentionally ignored. `HomePage` imports its `API` and `GreetingResponse`, then loads the backend from a Prolit `scopeResource`.

## Client-side routing and responsive layout

`app.fe/src/pages/HomePage.ts` is a class-based page decorated with `@route` and `@customElement`. `app.fe/src/main.ts` registers it with the TrunkJS Router and starts routing into `<router-content>`.

`ViteAutoHtml` creates `<tj-responsive>` as the SPA root. The frontend imports `@trunkjs/responsive`, and the example uses `style-md` attributes for breakpoint-specific layout instead of a resize listener.
