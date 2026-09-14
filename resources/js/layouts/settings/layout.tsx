import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { KeyRound, UserRound } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUrl } from '@/hooks/use-current-url';

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

            <Tabs
                value={
                    navigation.find((item) => isCurrentOrParentUrl(item.href))
                        ?.href || navigation[0].href
                }
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
                    {navigation.map((item) => (
                        <TabsTrigger
                            key={item.href}
                            value={item.href}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:py-1 sm:text-sm"
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="w-full min-w-0">{children}</div>
            </Tabs>
        </div>
    );
}
