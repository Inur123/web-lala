import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import PasswordInput from '@/components/password-input';
import TurnstileWidget from '@/components/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

export default function Login({
    turnstileSiteKey,
}: {
    turnstileSiteKey?: string | null;
}) {
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileResetKey, setTurnstileResetKey] = useState(0);

    return (
        <>
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onError={(errors) => {
                    const message =
                        errors.email ??
                        errors.password ??
                        errors['cf-turnstile-response'] ??
                        'Login gagal. Silakan periksa kembali data Anda.';

                    toast.error(message);
                    setTurnstileToken('');
                    setTurnstileResetKey((current) => current + 1);
                }}
                className="flex flex-col gap-5"
            >
                {({ processing }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email@example.com"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Kata sandi</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Masukkan kata sandi"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <input
                            type="hidden"
                            name="cf-turnstile-response"
                            value={turnstileToken}
                        />
                        <TurnstileWidget
                            siteKey={turnstileSiteKey}
                            action="login"
                            resetKey={turnstileResetKey}
                            onVerify={setTurnstileToken}
                        />
                        <Button
                            type="submit"
                            className="mt-2 h-11 w-full rounded-xl bg-[#1a4d2e] font-bold hover:bg-[#123620]"
                            tabIndex={3}
                            disabled={
                                processing ||
                                (Boolean(turnstileSiteKey) && !turnstileToken)
                            }
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            Masuk
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akun Anda',
};
