<?php

declare(strict_types=1);

namespace App;

use Brace\Body\BodyMiddleware;
use Brace\Core\AppLoader;
use Brace\Core\Base\ExceptionHandlerMiddleware;
use Brace\Core\Base\JsonReturnFormatter;
use Brace\Core\Base\NotFoundMiddleware;
use Brace\Core\BraceApp;
use Brace\Core\EnvironmentType;
use Brace\Router\RouterDispatchMiddleware;
use Brace\Router\RouterEvalMiddleware;
use Brace\SpaServe\Html\ViteAutoHtml;
use Brace\SpaServe\SpaStaticFileServerMw;

AppLoader::extend(function (BraceApp $app): void {
    $html = new ViteAutoHtml(
        development: $app->environmentType === EnvironmentType::DEVELOPMENT,
        title: 'Brace + Prolit Example',
        css: ['/assets/app.css'],
        javascript: ['/assets/app.js'],
        devEntrypoint: '/src/main.ts',
        startElement: 'tj-responsive',
    );

    $app->setPipe([
        new BodyMiddleware(),
        new ExceptionHandlerMiddleware(),
        new RouterEvalMiddleware(),
        new RouterDispatchMiddleware([new JsonReturnFormatter($app)]),
        new SpaStaticFileServerMw(
            bundleDir: __DIR__ . '/../app.fe/dist',
            html: $html,
            excludePaths: ['/api'],
        ),
        new NotFoundMiddleware(),
    ]);
});
