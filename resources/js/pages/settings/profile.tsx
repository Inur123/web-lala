import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { LogOut, UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logout } from '@/routes';
import type { Auth } from '@/types';

export default function Profile() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Pengaturan Profil" />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserRound className="size-5" /> Profil
                    </CardTitle>
                    <CardDescription>
                        Perbarui nama dan alamat email administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        action="/settings/profile"
                        method="patch"
                        options={{ preserveScroll: true }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={auth.user.name}
                                        autoComplete="name"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={auth.user.email}
                                        autoComplete="username"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="w-full sm:w-auto"
                                >
                                    Simpan Profil
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            <Button
                variant="ghost"
                className="mt-4 h-11 w-full justify-center rounded-xl bg-white text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 md:hidden"
                asChild
            >
                <Link
                    href={logout()}
                    as="button"
                    onClick={() => router.flushAll()}
                    data-test="mobile-logout-button"
                >
                    <LogOut className="mr-2 size-4" />
                    Keluar dari akun
                </Link>
            </Button>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [{ title: 'Pengaturan Akun', href: '/settings/profile' }],
};
