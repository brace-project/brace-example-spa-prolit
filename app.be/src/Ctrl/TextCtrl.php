<?php

declare(strict_types=1);

namespace App\Ctrl;

use App\Ctrl\Dto\TextInput;
use App\Ctrl\Dto\TextResponse;
use Brace\Router\Attributes\BraceRoute;

final class TextCtrl
{
    /**
     * Joins two strings supplied through a dedicated input DTO.
     *
     * Bare PHP array/object types do not convey a precise generated
     * TypeScript contract. This endpoint does not persist data.
     *
     * @param TextInput $body Two named input strings.
     * @return TextResponse Number of strings and joined text.
     * @example $input = new TextInput(); $input->first = 'Ada'; $input->second = 'Lin'; $result = (new TextCtrl())->post($input);
     * @see TextInput
     * @see TextResponse
     */
    #[BraceRoute('POST@/texts/join', name: 'Demo.JoinStrings')]
    public function post(TextInput $body): TextResponse
    {
        $response = new TextResponse();
        $response->count = 2;
        $response->joined = implode(', ', [$body->first, $body->second]);

        return $response;
    }
}
