<?php

declare(strict_types=1);

namespace App\Ctrl\Dto;

/** Result of a typed calculate POST request. */
final class CalculatePostResponse
{
    /** Number of requested terms. */
    public int $count;

    /** Sum of the first count squares. */
    public int $sumOfSquares;

    /** Server elapsed time in milliseconds. */
    public int $processingMs;
}
