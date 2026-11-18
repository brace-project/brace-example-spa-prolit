<?php

declare(strict_types=1);

namespace App\Ctrl;

use App\Ctrl\Dto\CalculateRequest;
use App\Ctrl\Dto\CalculateResponse;
use Brace\Router\Attributes\BraceRoute;

final class CalculateCtrl
{
    /**
     * Calculates a weighted sum of squares using a typed JSON body.
     *
     * The 700 ms pause demonstrates asynchronous UI loading. No state
     * is stored; count (1..1000) and multiplier (1..10) bound the work.
     *
     * @param CalculateRequest $body Calculation configuration.
     * @return CalculateResponse Weighted result and elapsed server time.
     * @throws \InvalidArgumentException For unsupported input ranges.
     * @example $input = new CalculateRequest(); $input->count = 5; $input->multiplier = 2; $input->label = 'Test'; $result = (new CalculateCtrl())->post($input);
     * @see CalculateRequest
     * @see CalculateResponse
     */
    #[BraceRoute('POST@/calculate', name: 'Demo.Calculate')]
    public function post(CalculateRequest $body): CalculateResponse
    {
        if ($body->count < 1 || $body->count > 1000) {
            throw new \InvalidArgumentException('count must be between 1 and 1000');
        }
        if ($body->multiplier < 1 || $body->multiplier > 10) {
            throw new \InvalidArgumentException('multiplier must be between 1 and 10');
        }

        $startedAt = hrtime(true);
        $sum = 0;

        for ($i = 1; $i <= $body->count; $i++) {
            $sum += $i * $i * $body->multiplier;
        }

        // Eine feste Demo-Pause macht den Pending-State sichtbar.
        usleep(700_000);

        $response = new CalculateResponse();
        $response->count = $body->count;
        $response->sumOfSquares = $sum;
        $response->processingMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);
        $response->label = $body->label;

        return $response;
    }
}
