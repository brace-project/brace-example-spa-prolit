<?php

declare(strict_types=1);

namespace App;

use App\Controller\GreetingController;
use Brace\Core\AppLoader;
use Brace\Core\BraceApp;
use Brace\SpaServe\Codegen\TypeScriptApiStubModule;

AppLoader::extend(function (BraceApp $app): void {
    $callback = [GreetingController::class, 'get'];
    $app->router->on('GET@/api/greeting', $callback);

    $api = new TypeScriptApiStubModule(
        targetFile: __DIR__ . '/../app.fe/src/generated-api.ts',
        autoGenerateInDevelopment: true,
    );
    $api->route(
        name: 'Demo.Greeting',
        path: '/api/greeting',
        methods: 'GET',
        callback: $callback,
    );
    $app->addModule($api);
});
