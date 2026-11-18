<?php

declare(strict_types=1);

namespace App\Ctrl\Dto;

/** Typed input for the text-joining API example. */
final class TextInput
{
    /** First text to join. */
    public string $first;

    /** Second text to join. */
    public string $second;
}
