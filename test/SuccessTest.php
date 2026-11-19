<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class SuccessTest extends TestCase
{
    public function testSuccess(): void
    {
        self::assertTrue(true);
    }
}
