<?php

declare(strict_types=1);

namespace App\Ctrl;

use App\Ctrl\Dto\TextResponse;
use Brace\Router\Attributes\BraceRoute;

final class TextCtrl
{
    /**
     * Joins a plain JSON array of strings with commas.
     *
     * Demonstrates a body without a dedicated input DTO. No data is stored.
     *
     * @param string[] $body List of texts, e.g. ["Ada", "Lin"].
     * @return TextResponse Count and joined string.
     * @throws \InvalidArgumentException If there are too many items or non-string entries.
     * @example $result = (new TextCtrl())->post(['Ada', 'Lin']);
     * @see TextResponse
     */
    #[BraceRoute('POST@/texts/join', name: 'Demo.JoinStrings')]
    public function post(array $body): TextResponse
    {
        if (count($body) > 20) {
            throw new \InvalidArgumentException('At most 20 strings are allowed');
        }
        foreach ($body as $value) {
            if (!is_string($value)) {
                throw new \InvalidArgumentException('Every item must be a string');
            }
        }

        $response = new TextResponse();
        $response->count = count($body);
        $response->joined = implode(', ', $body);

        return $response;
    }
}
