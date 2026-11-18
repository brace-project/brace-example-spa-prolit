# Brace + Prolit SPA example

Minimal SPA with a **Brace/PHP API** and a **TrunkJS Prolit** frontend.
Brace serves the SPA shell; Vite is used only for development and builds.

## Quick start

```bash
composer install
pnpm install
pnpm dev
```

- Development: Apache serves `www/` on port 80; Vite runs at
  `http://localhost:4000/` and proxies application requests to Apache.
- Production: run `pnpm build`, deploy `app.fe/dist/`, set
  `DEV_MODE=0`, and serve through Apache only.
- PHP/Composer dependencies must be available during Vite builds for
  API stub generation.

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
     (e.g. API.Demo.CalculatePost.request({ body }))
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
          app.fe/dist/
          +-- assets/app.js
          +-- assets/app.css
          +-- assets/*-[hash].js  (lazy-loaded chunks)
              |
              +---- deploy complete dist/ directory

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
                                            SPA HTML   app.fe/dist/
                                                       JS/CSS/chunks
```

- `DEV_MODE` selects the Brace application environment.
  SPA-Serve uses that environment automatically: development injects
  the Vite client; production references prebuilt `assets/app.js`
  and `assets/app.css` plus any lazy-loaded chunks.
- Switching `DEV_MODE` does **not** compile assets; build and deploy
  `app.fe/dist/` before serving production traffic.
- Production needs Apache/PHP and the built assets, **not** a running
  Vite or Node server. Missing assets return 404; SPA navigation
  receives the HTML shell. `CONF_APP_BASE_PATH` is the URL mount
  prefix and `CONF_API_BASE_URL` optionally overrides the API base.

## Directory map

```text
.
├── bootstrap.php                     # Shared CLI/web bootstrap
├── composer.json                      # PHP dependencies and PSR-4 mapping
├── package.json                       # Frontend dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Development server and build
├── app.be/                            # Brace backend
│   ├── 01_init.php                    # App environment and modules
│   ├── 10_middleware.php              # SPA shell and asset serving
│   ├── 20_routes.php                  # API routes and stub generation
│   └── src/
│       └── Ctrl/                      # HTTP controllers
│           ├── GreetingCtrl.php       # GET greeting API
│           ├── CalculateCtrl.php      # GET + POST calculation API
│           └── Dto/                   # Controller request/response DTOs
│               ├── GreetingResponse.php
│               ├── CalculateResponse.php
│               ├── CalculateInput.php
│               └── CalculatePostResponse.php
├── app.fe/                            # Prolit frontend
│   ├── src/
│   │   ├── main.ts                    # Register elements and start router
│   │   ├── app.scss                   # Shared styles
│   │   ├── generated-api.ts           # Generated; never edit
│   │   ├── pages/                     # Routable Web Components
│   │   │   ├── HomePage/
│   │   │   │   └── HomePage.ts
│   │   │   └── FormExamplePage/
│   │   │       ├── FormExamplePage.ts
│   │   │       └── dialogs/           # Page-local dialogs
│   │   │           └── FormExampleDialog.ts
│   │   ├── dialogs/                   # Shared dialogs
│   │   │   └── SettingsDialog.ts      # Typed POST example
│   │   └── elements/                  # Reusable Web Components
│   │       └── CalculateDemoElement.ts # Async GET example
│   └── dist/                           # Production build output
└── www/
    └── index.php                      # Apache front controller
```

Small pages can be a single file under `pages/`. For larger pages,
colocate page-only dialogs/elements under
`pages/<PageName>/dialogs/` and `pages/<PageName>/elements/`;
shared components go into top-level `dialogs/` or `elements/`.
Folder names are lowercase plurals; component classes use PascalCase.

## API demos

| Example | Frontend | Backend |
|---|---|---|
| Greeting | `pages/HomePage/HomePage.ts` | `GreetingCtrl::get` → `Demo.Greeting` |
| Calculation (GET) | `elements/CalculateDemoElement.ts` | `CalculateCtrl::get` → `Demo.Calculate` |
| Calculation (POST) | `dialogs/SettingsDialog.ts` | `CalculateCtrl::post` → `Demo.CalculatePost` |
| Form and modal | `pages/FormExamplePage/` | Client-side Prolit state and dialog |

The calculation Web Component calls the **generated** API client with
`scopeResource`. It shows pending, error and result states, supports
reload and passes the request's abort signal. The endpoint sums
`1² + ... + 1000² = 333833500`; its fixed 700 ms delay is for
demonstration, not a CPU benchmark.

Open **Calculation settings (POST)** on the homepage to send
`{ "count": 5 }` through `API.Demo.CalculatePost.request({ body })`.
`CalculateInput` and `CalculatePostResponse` are separate PHP DTOs;
valid input (1–1000) returns `sumOfSquares` (5 → 55). The dialog displays
pending, result and error states. This client needs the POST-body codegen
change in `brace-project/brace-mod-spaserve` PR #8.

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
