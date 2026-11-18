<?php

declare(strict_types=1);

namespace App\Ctrl;

use App\Ctrl\Dto\CalculateInput;
use App\Ctrl\Dto\CalculatePostResponse;
use App\Ctrl\Dto\CalculateResponse;
use Brace\Router\Attributes\BraceRoute;

final class CalculateCtrl
{
    /**
     * Calculates the sum of the first 1,000 squares with a visible demo delay.
     *
     * The bounded 700 ms pause is artificial: it demonstrates asynchronous
     * loading in the frontend, not the computational cost of the calculation.
     * This read-only endpoint has no persistent side effects.
     *
     * @return CalculateResponse Count, sum of squares and server elapsed time in ms.
     * @example $result = (new CalculateCtrl())->get();
     * @see CalculateResponse
     */
    #[BraceRoute('GET@/calculate', name: 'Demo.Calculate')]
    public function get(): CalculateResponse
    {
        $startedAt = hrtime(true);
        $sum = 0;

        for ($i = 1; $i <= 1000; $i++) {
            $sum += $i * $i;
        }

        // Make pending/loading visible even on a fast development machine.
        usleep(700_000);

        $response = new CalculateResponse();
        $response->count = 1000;
        $response->sumOfSquares = $sum;
        $response->processingMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        return $response;
    }

    /**
     * Sums the requested number of squares from a typed JSON POST body.
     *
     * Supports 1 to 1000 terms and has no persistent side effects.
     *
     * @param CalculateInput $body Input DTO, e.g. {"count": 5}.
     * @return CalculatePostResponse For count 5, returns sumOfSquares = 55.
     * @throws \InvalidArgumentException If count is outside 1..1000.
     * @example $body = new CalculateInput(); $body->count = 5; $result = (new CalculateCtrl())->post($body);
     * @see CalculateInput
     * @see CalculatePostResponse
     */
    #[BraceRoute('POST@/calculate', name: 'Demo.CalculatePost')]
    public function post(CalculateInput $body): CalculatePostResponse
    {
        if ($body->count < 1 || $body->count > 1000) {
            throw new \InvalidArgumentException('count must be between 1 and 1000');
        }

        $startedAt = hrtime(true);
        $sum = 0;

        for ($i = 1; $i <= $body->count; $i++) {
            $sum += $i * $i;
        }

        $response = new CalculatePostResponse();
        $response->count = $body->count;
        $response->sumOfSquares = $sum;
        $response->processingMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        return $response;
    }
}
