# Development and build: Vite + Brace SPA-Serve

[← Project overview and directory map](../README.md)

This page explains which server owns each request, how Vite provides HMR,
how the typed API client is regenerated, and how the production bundle is
served. The configuration lives in `vite.config.ts`,
`app.be/10_middleware.php` and `app.be/20_routes.php`.

## Development and production flow

### Development: Vite + Apache (`DEV_MODE=1`)

```text
Browser: http://localhost:4000/
           |
           v
   +--------------------------+
   | Vite dev server :4000    |
   | TS/SCSS modules + HMR    |
   +--------------------------+
      |                  |
      | /src/*, CSS/JS   | SPA navigation, /api/*
      | /@vite/*         | (proxy, URL unchanged)
      v                  v
  Vite serves       +------------------------------+
  frontend modules  | Apache :80 / www/index.php  |
  and HMR client    | PHP -> Brace                |
      ^             | API routes + SPA HTML shell |
      |             +------------------------------+
      |                          |
      +--- HTML references /@vite/client and /src/main.ts
```

- Apache stays active behind Vite. Brace generates the SPA HTML shell;
  Vite supplies source modules and the HMR client rather than built assets.
- Editing `app.fe/src/` TypeScript or SCSS triggers Vite updates;
  its HMR connection pushes changed modules/styles to the browser,
  preserving state where the changed module supports hot replacement.
  Otherwise Vite may reload the page.
- Browser API calls use the generated client and reach Brace through
  Vite's proxy on port 4000, not through a second frontend API.

### API stub generation (development and build)

```text
app.be/ named #[BraceRoute] + Ctrl + Dto
                  |
                  | Vite plugin watches existing app.be/** files
                  | (200 ms debounce); also runs at startup/build
                  v
     vendor/bin/brace spa-api-build
                  |
                  v
     TypeScriptApiGeneratorModule
                  |
                  v
     app.fe/src/generated-api.ts
                  |
                  v
     Vite module update / frontend imports
     (e.g. API.Demo.Calculate.request({ body }))
```

- The **backend** `app.be/` is watched to regenerate the API
  contract. Frontend changes under `app.fe/src/` use Vite/HMR;
  they do not themselves cause API stub generation.
- The generator includes named routes and their PHP request/response
  types. It runs on `pnpm dev` startup and during `pnpm build`.
- Creating or deleting backend files may not trigger the existing-file
  watcher; run `vendor/bin/brace spa-api-build` manually then.
  Never edit `generated-api.ts` by hand.
- Typed POST bodies require the pending SPA-Serve generator fix in
  [brace-mod-spaserve PR #8](https://github.com/brace-project/brace-mod-spaserve/pull/8).

### Production: build once, serve via Apache (`DEV_MODE=0`)

```text
BUILD / DEPLOY (before switching DEV_MODE)
  pnpm build
      |
      +-- generate API stubs from app.be/ PHP routes
      |
      +-- Vite compiles app.fe/src/main.ts + imports + SCSS
              |
              v
          app.fe/assets/dist/
          +-- app.js
          +-- app.css
          +-- *-[hash].js  (lazy-loaded chunks)
              |
              +---- deploy complete assets/dist/ directory

RUNTIME (DEV_MODE=0)
  Browser --> Apache :80 --> www/index.php --> Brace
                                      |
                     +----------------+----------------+
                     |                                 |
                  /api/*                         SPA navigation
                     |                                 |
               PHP controllers                  ViteAutoHtml
                                                 |     |
                                                 v     v
                                            SPA HTML   app.fe/assets/dist/
                                                       JS/CSS/chunks
```

- `DEV_MODE` selects the Brace application environment.
  SPA-Serve uses that environment automatically: development injects
  the Vite client; production references prebuilt `assets/dist/app.js`
  and `assets/dist/app.css` plus any lazy-loaded chunks.
- Switching `DEV_MODE` does **not** compile assets; build and deploy
  `app.fe/assets/dist/` before serving production traffic.
- Production needs Apache/PHP and the built assets, **not** a running
  Vite or Node server. Missing assets return 404; SPA navigation
  receives the HTML shell. `CONF_APP_BASE_PATH` is the URL mount
  prefix and `CONF_API_BASE_URL` optionally overrides the API base.

## Build and API contract

```bash
pnpm typecheck
pnpm build
# Only if manual API regeneration is needed:
vendor/bin/brace spa-api-build
```

- `TypeScriptApiGeneratorModule` generates the client from **named**
  `#[BraceRoute]` endpoints and typed PHP DTOs.
- Vite regenerates stubs on startup, build and changes to existing
  `app.be/` files. For newly created/deleted PHP files, regenerate
  manually when the watcher misses them.
- `DEV_MODE=1`: Apache + Vite/HMR. `DEV_MODE=0`: Apache + built assets;
  no Vite server or Node runtime in production.
- The SPA shell is generated by `ViteAutoHtml`, not an `AppShell.ts`.
  `CONF_APP_BASE_PATH` is the public mount prefix and
  `CONF_API_BASE_URL` optionally overrides API base URL.

## At a glance

| Mode | Browser entry | Frontend assets | API and SPA shell |
|---|---|---|---|
| Development (`DEV_MODE=1`) | Vite `:4000` | Source modules and HMR from Vite | Vite proxies to Apache/Brace `:80` |
| Production (`DEV_MODE=0`) | Apache `:80` | Built assets in `app.fe/assets/dist/` | Apache/Brace without Vite |

The SPA-Serve `ViteAutoHtml` component selects the development script
entrypoint (`/src/main.ts` plus Vite client) or the built
`assets/dist/app.js` / `assets/dist/app.css` references according to the Brace
environment. `SpaStaticFileServerMw` publishes files from `app.fe/assets/`,
including the `dist/` build, and serves SPA navigation while excluding `/api`
so API calls reach the controllers. The generated HTML includes a `<base>`
element derived automatically from the middleware's effective mount:
`/` by default, or `CONF_APP_BASE_PATH` when configured.

`vite-plugin-run` calls `vendor/bin/brace spa-api-build` on development
startup, production build and watched backend file changes. In contrast,
ordinary `app.fe/src/` edits go through Vite's module graph and HMR;
they do not require the PHP API stub generator.
