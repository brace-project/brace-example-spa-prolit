<?php

declare(strict_types=1);

namespace App\Ctrl;

use Brace\Router\Attributes\BraceRoute;

final class AnyCtrl
{
    /**
     * Returns an array derived from an unstructured JSON array body.
     *
     * No element type or shape is promised by this API contract.
     * Input entries are returned in reverse order; nothing is persisted.
     *
     * @param array $body JSON array with arbitrary element values.
     * @return array The submitted elements in reverse order.
     * @example $result = (new AnyCtrl())->post(['Ada', 7, true]); // [true, 7, 'Ada']
     * @see \Brace\Body\BodyMiddleware
     */
    #[BraceRoute('POST@/any/reverse', name: 'Demo.Any')]
    public function post(array $body): array
    {
        return array_reverse($body);
    }
}
