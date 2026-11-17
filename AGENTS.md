# Projektregeln: Brace SPA mit Prolit und Vite

## Aufbau und Zuständigkeiten

- `config.php` wird durch Docker konfiguriert. `DEV_MODE`, `CONF_APP_BASE_PATH` und `CONF_API_BASE_URL` sind die zentralen Laufzeiteinstellungen. Ihre Schreibweise oder Werte nicht ungefragt ändern.
- `bootstrap.php` lädt die Konfiguration und registriert `app.be/` als Brace-Anwendungsverzeichnis.
- `app.be/01_init.php` initialisiert Debug-/Umgebungsmodus, Brace, Request-Verarbeitung und Router. Die Umgebung muss der konfigurierten Betriebsart entsprechen; eine fest erzwungene Development-Umgebung darf Production nicht überschreiben.
- `app.be/10_middleware.php` verbindet Backend-Routing und SPA-Auslieferung. `ViteAutoHtml` verwendet ohne explizite Angabe (`development: null`) automatisch die Brace-Umgebung: Nur `EnvironmentType::DEVELOPMENT` aktiviert Vite, Production und Test verwenden Build-Dateien. Ein explizites `development: true` oder `false` hat Vorrang. Die SPA-Middleware löst den Modus bei der Brace-Anbindung auf, synchronisiert die HTML-Erzeugung und prüft erst dann das Production-Bundle-Verzeichnis. `SpaStaticFileServerMw` erhält `app.fe/dist` als Build-Verzeichnis.
- `app.be/20_routes.php` und `app.be/src/` enthalten Backend-Routen, Controller und DTOs.
- `app.fe/src/` enthält Frontend-Quellen. `generated-api.ts` wird durch `vendor/bin/brace spa-api-build` erzeugt und nicht manuell bearbeitet.
- `vite.config.ts` definiert Entwicklungsserver und Build. Konfiguration nicht als Ersatz für eine fehlerhafte serverseitige Modusumschaltung ändern.
- `vendor/brace/mod-spaserve` enthält die SPA-Middleware und HTML-Erzeugung. Änderungen an installierten Abhängigkeiten benötigen ausdrückliche Freigabe und müssen dauerhaft im Paket gesichert werden; Composer kann sie überschreiben.

## Development

Vite wird ausschließlich als Development-Server genutzt: TypeScript-/CSS-Verarbeitung, HMR und Frontend-Module. Vite leitet Backend-Anfragen und SPA-Navigation unverändert an Apache/Brace weiter. Apache läuft also auch im Development hinter Vite.

Nur im Development darf die HTML-Shell `@vite/client` und den Quell-Einstieg `/src/main.ts` einbinden. Ein direkter Zugriff auf Apache ist für sich allein kein zuverlässiges Merkmal für den Production-Modus.

## Production

In Production läuft ausschließlich Apache mit PHP/Brace, ohne Vite-Server, HMR oder Node-Laufzeit. Vite wird lediglich vorab im Build-Prozess verwendet (`npm run build`), niemals zur Auslieferung der Anwendung.

`mod-spaserve` muss sämtliche Frontend-Build-Dateien aus `app.fe/dist/` ausliefern, insbesondere JavaScript, CSS und dynamisch nachgeladene Chunks aus `app.fe/dist/assets/`. Production darf weder `@vite/client` noch `/src/main.ts` ausgeben oder einen erreichbaren Vite-Server voraussetzen.

Die HTML-Shell wird von `ViteAutoHtml` erzeugt und verweist auf die konfigurierten Production-Bundles (`assets/app.js`, `assets/app.css`). Das Build-Verzeichnis muss beim Deployment vorhanden sein. Fehlende Assets müssen einen 404 liefern, nicht die SPA-HTML-Shell. Clientseitige Navigationspfade erhalten dagegen die SPA-Shell.

## Routing-Prefix und API

`CONF_APP_BASE_PATH` wird an `BraceApp::$url_prefix` übergeben und ist der öffentliche Mount für Router und SPA-Auslieferung. `mod-spaserve` muss diesen Prefix beim Erzeugen von Asset-URLs und beim Auflösen angefragter Dateien relativ zu `app.fe/dist/` berücksichtigen. Das gilt auch für Lazy-Loading-Chunks und direkte Aufrufe verschachtelter SPA-Routen.

`url_prefix` ist der gemeinsame öffentliche URL-Pfadpräfix, keine vollständige URL und kein Dateisystempfad. Docker-Konstanten und Frontend-Meta-Namen werden durch diese PHP-Umbenennung nicht geändert.

`apiBaseUrl` gehört ausschließlich in die SPA-Konfiguration von `mod-spaserve`, nicht in `BraceApp`. `ViteAutoHtml` nimmt einen optionalen expliziten Override entgegen (auch für einen anderen Host), der bei der Middleware-Initialisierung erhalten bleibt. Ohne Override ermittelt `SpaStaticFileServerMw` die lokale API-Basis aus dem effektiven Mount und `apiMountPath` (Standard `/api`), beispielsweise `/demo/api`. Relative API-Basis-Pfade verwenden automatisch den Browser-Host. Der API-Mount muss mit der Registrierung der Backend-Routen übereinstimmen; die Middleware leitet ihn nicht aus `excludePaths` ab.

`CONF_API_BASE_URL` wird ausschließlich an die SPA-HTML-Konfiguration übergeben. Die Docker-Konfiguration bleibt unverändert und liefert aktuell bereits einen Default; für die automatische Modulermittlung muss der optionale Override leer bleiben. API-Routen werden vor der SPA-Middleware verarbeitet.

## Validierung

Bei Änderungen an der Modusumschaltung Development und Production getrennt prüfen. Production zusätzlich unter einem nichtleeren Routing-Prefix testen: HTML ohne Vite-Client, JS/CSS und Lazy-Loading-Chunks aus dem Build-Verzeichnis, SPA-Fallback sowie 404 für fehlende Assets. Vorhandene lokale Änderungen nicht überschreiben.
