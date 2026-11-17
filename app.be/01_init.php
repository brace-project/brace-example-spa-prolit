<?php

declare(strict_types=1);

namespace App;

use Brace\Core\AppLoader;
use Brace\Core\BraceApp;
use Brace\Core\EnvironmentType;
use Brace\Dbg\BraceDbg;
use Brace\Mod\Request\Zend\BraceRequestLaminasModule;
use Brace\Router\RouterModule;


BraceDbg::SetupEnvironment(true, ["192.168.178.20", "localhost", "localhost:4000", "localhost:5000", "pagebuilder.leuffen.de"]);

AppLoader::extend(function (): BraceApp {
    $app = new BraceApp(
        DEV_MODE === true ? EnvironmentType::DEVELOPMENT : EnvironmentType::PRODUCTION,
        url_prefix: \CONF_APP_BASE_PATH,
    );
    $app->addModule(new BraceRequestLaminasModule());
    $app->addModule(new RouterModule());

    return $app;
});
