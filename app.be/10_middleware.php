<?php

declare(strict_types=1);

namespace App;

use Brace\Body\BodyMiddleware;
use Brace\Core\AppLoader;
use Brace\Core\Base\ExceptionHandlerMiddleware;
use Brace\Core\Base\JsonReturnFormatter;
use Brace\Core\Base\NotFoundMiddleware;
use Brace\Core\BraceApp;
use Brace\Router\RouterDispatchMiddleware;
use Brace\Router\RouterEvalMiddleware;
use Brace\SpaServe\Html\ViteAutoHtml;
use Brace\SpaServe\SpaStaticFileServerMw;

AppLoader::extend(function (BraceApp $app): void {
    $html = new ViteAutoHtml(
        apiBaseUrl: \CONF_API_BASE_URL,
        title: 'Brace + Prolit Example',
        css: ['assets/app.css'],
        javascript: ['assets/app.js'],
        startHtml: '<nte-feedback></nte-feedback><tj-responsive><router-content></router-content></tj-responsive>',
        devEntrypoint: '/src/main.ts',
    );

    // Keep the public asset mount scoped to the generated build directory.
    $assets = new SpaStaticFileServerMw(
        bundleDir: __DIR__ . '/../app.fe/assets/dist',
        html: new ViteAutoHtml(),
        mount: rtrim($app->url_prefix, '/') . '/assets',
        excludePaths: [],
        spaRoutes: [],
    );

    $app->setPipe([
        new BodyMiddleware(),
        new ExceptionHandlerMiddleware(),
        new RouterEvalMiddleware(),
        new RouterDispatchMiddleware([new JsonReturnFormatter($app)]),
        $assets,
        new SpaStaticFileServerMw(
            bundleDir: __DIR__ . '/../app.fe/assets/dist',
            html: $html,
            excludePaths: ['/api'],
        ),
        new NotFoundMiddleware(),
    ]);
});
