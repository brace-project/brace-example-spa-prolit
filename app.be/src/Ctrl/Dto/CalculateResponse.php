<?php

declare(strict_types=1);

namespace App\Ctrl\Dto;

/** Typed result of the demonstration calculation. */
final class CalculateResponse
{
    /** Number of terms summed. */
    public int $count;

    /** Sum of 1² + 2² + ... + count². */
    public int $sumOfSquares;

    /** Server-side elapsed time in milliseconds, including the demo delay. */
    public int $processingMs;
}
