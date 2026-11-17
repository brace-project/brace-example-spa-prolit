<?php

declare(strict_types=1);

namespace App;

use App\Ctrl\GreetingCtrl;
use Brace\Core\AppLoader;
use Brace\Core\BraceApp;
use Brace\SpaServe\Codegen\TypeScriptApiGeneratorModule;

AppLoader::extend(function (BraceApp $app): void {
    $apiMountPath = '/api';

    // Registers every #[BraceRoute] method of the controller below the local API mount.
    // A route name such as "Demo.Greeting" marks the route for TypeScript generation.
    $app->router->registerClass($apiMountPath, GreetingCtrl::class);

    // Reads all named routes already registered on the router and generates their
    // paths, HTTP methods, parameters, response DTOs and client methods automatically.
    // Unnamed routes remain available in Brace but are omitted from generated-api.ts.
    $app->addModule(new TypeScriptApiGeneratorModule(
        targetFile: __DIR__ . '/../app.fe/src/generated-api.ts',
        autoGenerateInDevelopment: true,
        apiMountPath: $apiMountPath,
    ));
});
