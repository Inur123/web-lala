import { Form, Head, usePage } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
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
                                >
                                    Simpan Profil
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [{ title: 'Pengaturan Akun', href: '/settings/profile' }],
};
