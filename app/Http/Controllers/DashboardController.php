<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $registrants = Registration::query()
            ->select([
                'id', 'name', 'gender', 'delegation',
                'admin_status', 'screening_status', 'created_at',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';

        return Inertia::render('Dashboard/Index', [
            'registrants' => $registrants,
            'registrationOpen' => $isOpen,
        ]);
    }
}
