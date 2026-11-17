# Brace + Prolit SPA example

This repository is an application-level example for a Brace backend and a TrunkJS Prolit frontend. Brace owns the HTTP/API side and the SPA shell; the browser application uses Prolit, the TrunkJS Router and TrunkJS Responsive.

## Structure

- `bootstrap.php` — central project bootstrap for CLI and web execution.
- `composer.json` — PHP dependencies and Composer bootstrap wiring.
- `package.json`, `tsconfig.json`, `vite.config.ts` — frontend toolchain for the whole project.
- `app.be/` — Brace init, middleware, routes and backend source.
- `app.fe/` — frontend source and build output.
- `www/index.php` — Apache/front-controller entrypoint only.

The root `bootstrap.php` is registered through Composer's `autoload.files`. Both `vendor/bin/brace` and `www/index.php` load Composer's autoloader, so both execution paths pass through the same bootstrap before `AppLoader::loadApp()` runs.

`bootstrap.php` sets the Brace application root to `app.be/` via `AppLoader::SetAppRoot(__DIR__ . '/app.be')`. Brace then loads the three numbered application files from there:

- `app.be/01_init.php` — creates the Brace application and registers the base modules.
- `app.be/10_middleware.php` — configures middleware and the SPA shell.
- `app.be/20_routes.php` — registers the demo controller and TypeScript API stub generation.

## Frontend toolchain

The Node/Vite/TypeScript configuration lives in the repository root because backend and frontend are two parts of one deployable application. `pnpm install` therefore creates the project-level `node_modules/`; Vite uses `app.fe/` as its source root and emits the production bundle into `app.fe/dist/`.

The current TrunkJS Prolit reorganization is not fully published yet. `package.json` therefore installs the required packages directly from their package directories in `trunkjs/trunkjs-monorepo` through pnpm Git dependencies. Vite and TypeScript aliases point at those checked-out TypeScript entry files.

Frontend styles are authored as SCSS in `app.fe/src/app.scss`. Vite compiles them through Sass and emits the production stylesheet as `app.fe/dist/assets/app.css`.

After the TrunkJS packages are published, replace the Git dependencies with normal semver versions and remove the temporary source aliases from `vite.config.ts` and `tsconfig.json`.

## Run the example

Install backend and frontend dependencies from the repository root:

```bash
composer install
pnpm install
```

### Development: Apache + Vite

Apache runs on **port 80**, with `www/` as the document root and `www/index.php` as the Brace front controller. Docker supplies the runtime configuration in `config.php`; `DEV_MODE=1` selects `EnvironmentType::DEVELOPMENT` when constructing `BraceApp` in `app.be/01_init.php`. This application environment is independent of the debugger's host-based configuration.

Start Vite from the repository root:

```bash
pnpm dev
```

Open `http://localhost:4000/`. Vite runs on **port 4000** and serves TypeScript modules, SCSS/CSS and HMR. It proxies API requests and SPA navigation unchanged to Apache at `http://127.0.0.1:80`. Apache/Brace handles backend routes and generates the SPA HTML shell. In development, that shell loads `/@vite/client` and `/src/main.ts` instead of production bundles.

Vite is used **only as a development server**, never as a production server. Apache also runs during development; accessing Apache directly does not itself select the production environment.

### Production: Apache only

Build the frontend before deploying or enabling production mode:

```bash
pnpm build
```

Vite is a build-time tool here: it generates `app.fe/dist/`, including `assets/app.js`, `assets/app.css` and lazy-loaded JavaScript chunks. Node and a running Vite server are not required to serve the deployed application.

With **`DEV_MODE=0`**, `app.be/01_init.php` explicitly constructs `BraceApp` with `EnvironmentType::PRODUCTION`. The default `ViteAutoHtml` configuration and `SpaStaticFileServerMw` automatically use this BraceApp environment; no separate Vite-mode switch is necessary. Leave the optional `development` override unset to retain this automatic behavior.

Open `http://localhost/` on **Apache port 80** (or the configured public host and URL prefix). Apache/Brace serves both the API and the built frontend:

- `mod-spaserve` reads bundle files from `app.fe/dist/`, including CSS, JavaScript and lazy-loading chunks under `app.fe/dist/assets/`.
- The configured `BraceApp::$url_prefix` is respected when generating asset links and resolving requests against the build directory.
- Client-side navigation paths receive the SPA HTML shell; missing assets return HTTP 404.
- Production HTML contains neither `@vite/client` nor `/src/main.ts` and does not depend on a Vite server.
- `<meta name="app-env" content="production">` exposes the actual BraceApp environment in the generated HTML.

The complete `app.fe/dist/` directory must be present in the deployment. Switching `DEV_MODE` does not build the bundle automatically.

## HTML shell

Brace generates the complete initial application structure through `ViteAutoHtml`:

```php
startHtml: '<tj-responsive><router-content></router-content></tj-responsive>',
```

There is intentionally no `AppShell.ts`. The TypeScript entrypoint only registers the responsive element, page classes and Router, then starts navigation against the already present `<router-content>`.

## TypeScript API stub

The client stub is generated by `brace/mod-spaserve`, not by custom frontend code.

`app.be/20_routes.php` configures `TypeScriptApiGeneratorModule` with:

```text
app.fe/src/generated-api.ts
```

as its output file. The module reads all named routes already registered on the Brace router, inspects their callbacks through `phore/schema`, generates the typed TypeScript API client through `TypeScriptApiStubGenerator`, and registers the Brace command:

```bash
vendor/bin/brace spa-api-build
```

While the Vite dev server is running, `vite.config.ts` adds `app.be/` to Vite's watcher. The installed `vite-plugin-run` invokes that command when an existing backend file is saved, with a 200 ms debounce. Command output appears in the dev-server terminal. The generated frontend file does not trigger another API build.

This uses the plugin's hot-update hook: file creation and deletion are not covered reliably, and builds are not serialized if another change occurs while a command is running.

The current `vite-plugin-run` configuration also runs `spa-api-build` when Vite starts (`startup: true`) and during production builds (`build: true`). Thus `pnpm dev` and `pnpm build` regenerate the API contract automatically. Unchanged output is not rewritten. The PHP backend and Composer dependencies must therefore be available in the build environment.

To regenerate the stub manually, independently of Vite, use the command above or its package-script alias:

```bash
pnpm api:build
```

The generated file is ignored and must not be edited manually. `HomePage` imports `API` and `GreetingResponse` from it.

## Declarative routing and responsive layout

Backend controllers use the `XyCtrl` naming convention and live in `app.be/src/Ctrl/` under the `App\Ctrl` namespace.

`GreetingCtrl::get()` declares its backend route with `#[BraceRoute(...)]`; `app.be/20_routes.php` registers the controller class. `app.fe/src/pages/HomePage.ts` is likewise a class-based page decorated with `@route` and `@customElement`. `app.fe/src/main.ts` registers it with the TrunkJS Router.

`ViteAutoHtml` creates `<tj-responsive><router-content></router-content></tj-responsive>` as the application body. The frontend imports `@trunkjs/responsive`, and the page uses `style-md` attributes for breakpoint-specific layout instead of a resize listener.
