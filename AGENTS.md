# Repository rules: Brace + Prolit SPA

## Ownership

| Path | Responsibility |
|---|---|
| `app.be/` | Brace/PHP routes, middleware and controllers |
| `app.be/src/Ctrl/Dto/` | Controller request/response DTOs (PSR-4: `App\\Ctrl\\Dto`) |
| `app.fe/src/pages/` | Routed pages; page-local `dialogs/`, `elements/` |
| `app.fe/src/dialogs/` | Shared dialogs |
| `app.fe/src/elements/` | Shared Prolit Web Components |
| `app.fe/src/generated-api.ts` | Generated client; **never edit manually** |
| `app.fe/dist/` | Build output; deploy the complete directory |
| `www/index.php` | Apache front controller |

- Keep small pages flat; give larger pages a same-named folder.
- Keep page-only dependencies with their page. Use the shared folders
  only for cross-page components. No `features/` system yet.
- Read `README.md` for the directory map and example flows.

## Environment and build contracts

- `bootstrap.php` loads Docker `config.php` and configures `app.be/`.
  Preserve `DEV_MODE`, `CONF_APP_BASE_PATH`, `CONF_API_BASE_URL`.
- `app.be/01_init.php` chooses the `BraceApp` environment from
  `DEV_MODE` independently of debugger host settings.
- `ViteAutoHtml` and `SpaStaticFileServerMw` use the Brace environment
  by default: Vite only for development; built assets in production.
- Apache runs on port 80 in both modes. `pnpm dev` starts Vite on 4000
  and proxies requests to Apache. Production uses Apache only.
- Build with `pnpm build` before deployment. Missing assets must return
  404; SPA navigation must receive the HTML shell. Check URL prefixes,
  CSS, JS and lazy chunks when changing SPA serving.
- **Before any change to `vite.config.ts`, request explicit approval
  for that specific change.** Do not mask backend mode bugs in Vite.
- Do not modify installed `vendor/` or `node_modules/` sources.

## API generation

- Register controllers in `app.be/20_routes.php` before
  `TypeScriptApiGeneratorModule`; named `#[BraceRoute]` methods
  become typed client methods from PHP DTOs.
- Generate with `vendor/bin/brace spa-api-build`; Vite invokes it on
  startup, build and existing `app.be/` file changes (200 ms debounce).
  File creation/deletion may require a manual run; builds can overlap.
- Never generate API stubs from HTTP requests or module initialization.
  Backend and Composer dependencies must be available during frontend
  builds. Never edit `generated-api.ts` directly.
