import { useState, useEffect } from 'react';

export function usePwaInstall() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode (PWA installed)
        const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone === true;
        setIsStandalone(isAppStandalone);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        if (isAppStandalone) {
            return;
        }

        // For Android/Desktop: check if deferredPrompt is already set or listen to the event
        if (window.deferredPrompt) {
            setIsInstallable(true);
        }

        const handleInstallable = () => setIsInstallable(true);
        window.addEventListener('pwa-installable', handleInstallable);

        return () => {
            window.removeEventListener('pwa-installable', handleInstallable);
        };
    }, []);

    const promptInstall = async () => {
        if (!window.deferredPrompt) return;
        
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setIsInstallable(false);
            window.deferredPrompt = null;
        }
    };

    return { isInstallable, isIos, isStandalone, promptInstall };
}
