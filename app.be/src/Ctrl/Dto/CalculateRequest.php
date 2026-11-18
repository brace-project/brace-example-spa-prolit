<?php

declare(strict_types=1);

namespace App\Ctrl\Dto;

/** Structured POST configuration for the calculation example. */
final class CalculateRequest
{
    /** Number of terms to sum (1–1000). */
    public int $count;

    /** Scale each squared term (1–10). */
    public int $multiplier;

    /** Display label returned alongside the result. */
    public string $label;
}
