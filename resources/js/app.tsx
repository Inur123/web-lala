import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PublicLayout from '@/layouts/public-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const publicPages = new Set(['Landing', 'Pendaftar', 'Register', 'welcome']);

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (publicPages.has(name)) {
            return PublicLayout;
        }

        if (name.startsWith('auth/')) {
            return AuthLayout;
        }

        if (name.startsWith('settings/')) {
            return [AppLayout, SettingsLayout];
        }

        if (
            name.startsWith('Dashboard/') ||
            name.startsWith('Registrasi/') ||
            name.startsWith('Settings/') ||
            name === 'dashboard'
        ) {
            return AppLayout;
        }

        // Unknown pages must not inherit private dashboard navigation.
        return null;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
