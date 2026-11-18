<?php

declare(strict_types=1);

namespace App\Ctrl;

use App\Ctrl\Dto\GreetingResponse;
use Brace\Router\Attributes\BraceRoute;

final class GreetingCtrl
{
    /**
     * Returns the minimal backend payload used by the frontend example.
     *
     * The endpoint performs no I/O beyond returning the DTO and has no side effects.
     *
     * @return GreetingResponse Typed response consumed through the generated TypeScript API stub.
     * @example $response = (new GreetingCtrl())->get();
     * @see GreetingResponse
     */
    #[BraceRoute('GET@/greeting', name: 'Demo.Greeting')]
    public function get(): GreetingResponse
    {
        $response = new GreetingResponse();
        $response->message = 'Hello from Brace';
        $response->backend = 'Brace';

        return $response;
    }
}
