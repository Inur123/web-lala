<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('registrations:retry-uploads')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('registrations:cleanup-failed-files')
    ->dailyAt('02:00')
    ->withoutOverlapping();
