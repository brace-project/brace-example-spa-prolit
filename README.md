# Brace + Prolit SPA example

This repository is an application-level example for a Brace backend and a TrunkJS Prolit frontend. Brace owns the HTTP/API side and the SPA shell; the browser application uses Prolit, the TrunkJS Router and TrunkJS Responsive.

## Structure

- `bootstrap.php` — central project bootstrap for CLI and web execution.
- `app.be/` — Brace init, middleware, routes and backend source.
- `app.fe/` — complete frontend build unit: package metadata, Vite/TypeScript configuration, routed Prolit elements and generated API client.
- `www/index.php` — Apache/front-controller entrypoint only.

The root `bootstrap.php` is registered through Composer's `autoload.files`. Both `vendor/bin/brace` and `www/index.php` load Composer's autoloader, so both execution paths pass through the same bootstrap before `AppLoader::loadApp()` runs.

`bootstrap.php` sets the Brace application root to `app.be/` via `AppLoader::SetAppRoot(__DIR__ . '/app.be')`. Brace then loads the three numbered application files from there:

- `app.be/01_init.php` — creates the Brace application and registers the base modules.
- `app.be/10_middleware.php` — configures middleware and the SPA shell.
- `app.be/20_routes.php` — registers the demo controller and TypeScript API stub generation.

### Why the Node/Vite configuration is inside app.fe

Keeping `package.json`, `vite.config.ts` and `tsconfig.json` in `app.fe/` makes the frontend a self-contained build boundary. `node_modules`, Vite cache and build output stay below `app.fe/`, backend-only tooling does not need to treat the repository root as a Node project, and the frontend can later be built or extracted independently.

The trade-off is that commands run from `app.fe/` need relative paths to repository-level tools such as `../vendor/bin/brace`, and CI/developer setup has separate Composer and pnpm install steps. For this example that separation is intentional.

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

## HTML shell

Brace generates the complete initial application structure through `ViteAutoHtml`:

```php
startHtml: '<tj-responsive><router-content></router-content></tj-responsive>',
```

There is intentionally no `AppShell.ts`. The TypeScript entrypoint only registers the responsive element, page classes and Router, then starts navigation against the already present `<router-content>`.

## Typed API stub

`app.be/20_routes.php` registers the attribute-declared Brace controller and `TypeScriptApiStubModule`. The module writes the generated client to:

```text
app.fe/src/generated-api.ts
```

With `autoGenerateInDevelopment: true`, normal Brace application loading generates it in development. In addition, `app.fe/vite.config.ts` runs the module's `spa-api-build` command when Vite starts and before a production build. It can also be generated explicitly from the repository root:

```bash
vendor/bin/brace spa-api-build
```

The generated file is ignored and must not be edited manually. `HomePage` imports its `API` and `GreetingResponse`, then loads the backend from a Prolit `scopeResource`.

## Declarative routing and responsive layout

`GreetingController::get()` declares its backend route with `#[BraceRoute(...)]`; `app.be/20_routes.php` registers the controller class. `app.fe/src/pages/HomePage.ts` is likewise a class-based page decorated with `@route` and `@customElement`. `app.fe/src/main.ts` registers it with the TrunkJS Router.

`ViteAutoHtml` creates `<tj-responsive><router-content></router-content></tj-responsive>` as the application body. The frontend imports `@trunkjs/responsive`, and the page uses `style-md` attributes for breakpoint-specific layout instead of a resize listener.
