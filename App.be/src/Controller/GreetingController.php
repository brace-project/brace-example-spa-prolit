<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\GreetingResponse;

final class GreetingController
{
    /**
     * Returns the minimal backend payload used by the frontend example.
     *
     * The endpoint performs no I/O beyond returning the DTO and has no side effects.
     *
     * @return GreetingResponse Typed response consumed through the generated TypeScript API stub.
     * @example $response = (new GreetingController())->get();
     * @see GreetingResponse
     */
    public function get(): GreetingResponse
    {
        $response = new GreetingResponse();
        $response->message = 'Hello from Brace';
        $response->backend = 'Brace';

        return $response;
    }
}
