<?php

declare(strict_types=1);

namespace App;

use Brace\Core\AppLoader;
use Brace\Core\BraceApp;
use Brace\Dbg\BraceDbg;
use Brace\Mod\Request\Zend\BraceRequestLaminasModule;
use Brace\Router\RouterModule;


BraceDbg::SetupEnvironment(true, ["192.168.178.20", "localhost", "localhost:4000", "localhost:5000", "pagebuilder.leuffen.de"]);

AppLoader::extend(function (): BraceApp {
    $app = new BraceApp(
        appBasePath: \CONF_APP_BASE_PATH,
        apiBaseUrl: \CONF_API_BASE_URL,
    );
    $app->addModule(new BraceRequestLaminasModule());
    $app->addModule(new RouterModule());

    return $app;
});
