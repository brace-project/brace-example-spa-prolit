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

- Bare PHP `array`/`object` body or response types do not establish
  typed element/field shapes; prefer explicit input/output DTOs.
  Never describe a plain PHP `array` as a typed `string[]` API.

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

## Frontend design system and agent workflow

- **Nextstrap first:** Build new UI and visual styling from the installed `@nextrap/style-*` packages, their semantic components, classes, design tokens and utilities. Prefer NTE Web Components such as `nte-input` and `nte-data-table` over custom alternatives. Follow the existing imports in `app.fe/src/app.scss`, registration in `app.fe/src/main.ts`, and patterns in `app.fe/src/pages/`. Keep accessibility and semantic HTML intact.
- Before introducing any custom CSS selector, new visual token, hard-coded visual value, handcrafted component styling, or a replacement for a Nextstrap component, inspect the existing Nextstrap package documentation and examples. **If the required style/component is unavailable or seems to require manual CSS, ask the user for a decision first**: extend/reuse Nextstrap upstream or explicitly approve a local exception. Do not silently add a parallel styling system. Existing inline styles are examples of current code, not blanket approval for new custom styling.
- **Responsive behavior:** Use `@trunkjs/responsive` for breakpoint-dependent classes and element-level responsive styling, rather than bespoke resize listeners or one-off media queries. The package is already imported from `app.fe/src/main.ts`; ensure the application content is inside the required `<tj-responsive>` root when working on the HTML shell. Prefer existing Nextstrap utilities with responsive prefixes (`-md:d-none`, `md:d-flex`, `md-xl:d-block`); use `style-md="..."` / `style-xl="..."` for genuinely element-specific properties. Runtime bracket-value utilities are last-resort exceptions, not a way to define recurring styles.
- **Central UI feedback:** Use the installed `@nextrap/nte-feedback` static `Feedback` API for loading, progress, success, error, information, alerts and confirmations; mount `<nte-feedback>` once in the application shell. Prefer `Feedback.alert()` and `Feedback.confirm()` to browser `alert()` / `confirm()` and do not invent ad-hoc global events or separate feedback UIs. For normal backend requests use the existing `app.fe/src/requestFeedback.ts` wrapper: it tracks concurrent requests, starts the central loading indicator with the first request and closes it only after the last settles, including on failure. Use `Feedback.progress()` for measurable progress and show explicit success/error feedback when the interaction needs it; do not suppress errors.
- **Before modifying a page:** inspect the relevant Nextstrap/NTE documentation, responsive reference, and nearby existing components; choose the closest reusable implementation. If design coverage is missing, stop and ask rather than inventing styles. Keep changes within the requested scope and check layouts at mobile and desktop breakpoints, feedback lifecycles (including errors/concurrency), and keyboard/accessibility behavior.

Canonical sources:
- [Nextrap monorepo](https://github.com/nextrap/nextrap-monorepo) and [NTE Feedback documentation](https://github.com/nextrap/nextrap-monorepo/tree/main/nextrap-elements/nte-feedback)
- [TrunkJS responsive README](https://github.com/trunkjs/trunkjs-monorepo/blob/main/packages/responsive/README.md) and [agent usage reference](https://github.com/trunkjs/trunkjs-monorepo/blob/main/packages/responsive/.ai-usage-info.md)
