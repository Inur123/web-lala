import { usePage } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;
    const { state } = useSidebar();

    if (state === 'collapsed') {
        return (
            <div className="flex items-center justify-center">
                <AppLogoIcon className="size-8 object-contain mix-blend-multiply" />
            </div>
        );
    }

    return (
        <div className="flex w-full items-center">
            <img
                src="/images/logo-lala-2.png"
                alt={name as string}
                className="h-10 w-auto object-contain"
            />
        </div>
    );
}
