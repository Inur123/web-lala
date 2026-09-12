import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function Security({ passwordRules }: { passwordRules: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Pengaturan Kata Sandi" />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="size-5" /> Kata Sandi
                    </CardTitle>
                    <CardDescription>
                        Gunakan kata sandi yang panjang dan tidak dipakai di
                        layanan lain.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        action="/settings/password"
                        method="put"
                        options={{ preserveScroll: true }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) passwordInput.current?.focus();
                            if (errors.current_password)
                                currentPasswordInput.current?.focus();
                        }}
                        className="space-y-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">
                                        Kata Sandi Saat Ini
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Kata Sandi Baru
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        autoComplete="new-password"
                                        passwordrules={passwordRules}
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Kata Sandi Baru
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        passwordrules={passwordRules}
                                        required
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    Simpan Kata Sandi
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

Security.layout = {
    breadcrumbs: [{ title: 'Pengaturan Akun', href: '/settings/security' }],
};
