import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { KeyRound, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

const navigation = [
    { title: 'Profil', href: '/settings/profile', icon: UserRound },
    { title: 'Kata Sandi', href: '/settings/security', icon: KeyRound },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="w-full p-4 md:p-6">
            <div className="mb-6 space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Pengaturan Akun
                </h1>
                <p className="text-muted-foreground text-sm">
                    Kelola profil dan keamanan akun administrator.
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                <nav
                    className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto lg:w-52 lg:flex-col"
                    aria-label="Pengaturan akun"
                >
                    {navigation.map((item) => (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                'h-10 w-full justify-center sm:justify-start lg:w-full',
                                {
                                    'bg-muted font-semibold':
                                        isCurrentOrParentUrl(item.href),
                                },
                            )}
                            asChild
                        >
                            <Link
                                href={item.href}
                                className="flex items-center justify-center gap-2 sm:justify-start"
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span>{item.title}</span>
                            </Link>
                        </Button>
                    ))}
                </nav>

                <Separator className="lg:hidden" />
                <div className="w-full max-w-2xl">{children}</div>
            </div>
        </div>
    );
}
