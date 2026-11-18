<?php

declare(strict_types=1);

namespace App\Ctrl;

use App\Dto\CalculateResponse;
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
}
