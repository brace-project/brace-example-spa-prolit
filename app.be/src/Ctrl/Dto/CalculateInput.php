<?php

declare(strict_types=1);

namespace App\Ctrl\Dto;

/** JSON request payload for the configurable sum-of-squares route. */
final class CalculateInput
{
    /** Number of terms to calculate (1–1000). */
    public int $count;
}
