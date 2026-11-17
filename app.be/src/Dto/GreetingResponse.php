<?php

declare(strict_types=1);

namespace App\Dto;

/** Payload generated into the frontend API contract by brace/mod-spaserve. */
final class GreetingResponse
{
    /**
     * Description of the message property, which is a string containing the greeting message. Wurstbrot
     * @var string
     */
    public string $message;

    /**
     * Description of the backend property, which is a string indicating the backend source of the greeting.
     * @var string
     */
    public string $backend;
}
