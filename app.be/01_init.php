<?php

declare(strict_types=1);

namespace App;

use Brace\Core\AppLoader;
use Brace\Core\BraceApp;
use Brace\Mod\Request\Zend\BraceRequestLaminasModule;
use Brace\Router\RouterModule;

AppLoader::extend(function (): BraceApp {
    $app = new BraceApp();
    $app->addModule(new BraceRequestLaminasModule());
    $app->addModule(new RouterModule());

    return $app;
});
