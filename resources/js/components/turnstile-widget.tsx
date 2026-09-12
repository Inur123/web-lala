import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type TurnstileOptions = {
    sitekey: string;
    action: string;
    theme: 'light';
    size: 'normal';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
};

type TurnstileApi = {
    render: (container: HTMLElement, options: TurnstileOptions) => string;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            'script[data-cloudflare-turnstile]',
        );
        const script = existing ?? document.createElement('script');

        const handleLoad = () => {
            if (window.turnstile) resolve(window.turnstile);
            else reject(new Error('Cloudflare Turnstile gagal dimuat.'));
        };

        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener(
            'error',
            () => reject(new Error('Cloudflare Turnstile gagal dimuat.')),
            { once: true },
        );

        if (!existing) {
            script.src =
                'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.dataset.cloudflareTurnstile = 'true';
            document.head.appendChild(script);
        }
    }).catch((error) => {
        scriptPromise = null;
        throw error;
    });

    return scriptPromise as Promise<TurnstileApi>;
}

export default function TurnstileWidget({
    siteKey,
    action,
    onVerify,
    resetKey = 0,
}: {
    siteKey?: string | null;
    action: 'login' | 'registration';
    onVerify: (token: string) => void;
    resetKey?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onVerifyRef = useRef(onVerify);
    const [isLoading, setIsLoading] = useState(Boolean(siteKey));

    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    useEffect(() => {
        if (!siteKey || !containerRef.current) return;

        let active = true;
        let widgetId: string | null = null;

        setIsLoading(true);
        onVerifyRef.current('');

        void loadTurnstile()
            .then((turnstile) => {
                if (!active || !containerRef.current) return;

                widgetId = turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    action,
                    theme: 'light',
                    size: 'normal',
                    callback: (token) => onVerifyRef.current(token),
                    'expired-callback': () => onVerifyRef.current(''),
                    'error-callback': () => onVerifyRef.current(''),
                });

                requestAnimationFrame(() => {
                    if (active) setIsLoading(false);
                });
            })
            .catch(() => {
                if (active) setIsLoading(false);
                onVerifyRef.current('');
            });

        return () => {
            active = false;
            if (widgetId && window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [action, resetKey, siteKey]);

    if (!siteKey) return null;

    return (
        <div className="flex w-full justify-start" aria-live="polite">
            <div className="relative h-[65px] w-[300px] max-w-full">
                {isLoading && (
                    <div className="bg-card absolute inset-0 z-10 flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-10 shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-2.5 w-20" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <Skeleton className="size-8" />
                            <Skeleton className="h-2 w-10" />
                        </div>
                    </div>
                )}
                <div ref={containerRef} className="h-[65px] w-[300px]" />
            </div>
        </div>
    );
}
