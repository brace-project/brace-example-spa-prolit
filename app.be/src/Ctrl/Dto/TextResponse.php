<?php

declare(strict_types=1);

namespace App\Ctrl\Dto;

/** Output of the array-of-strings POST example. */
final class TextResponse
{
    /** Number of supplied strings. */
    public int $count;

    /** Strings joined with comma and space. */
    public string $joined;
}
