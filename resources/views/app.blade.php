<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light only">

        <style>
            html {
                background-color: oklch(1 0 0);
                color-scheme: light;
            }
        </style>

        <meta name="theme-color" content="#ffffff">
        <link rel="manifest" href="/build/manifest.webmanifest">
        <link rel="icon" href="/images/logo-lala.webp" type="image/png">
        <link rel="apple-touch-icon" href="/images/pwa-192x192.webp">

        <meta name="apple-mobile-web-app-capable" content="yes">

<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2048-2732.webp" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2732-2048.webp" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1668-2388.webp" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2388-1668.webp" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1536-2048.webp" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2048-1536.webp" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1640-2360.webp" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2360-1640.webp" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1668-2224.webp" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2224-1668.webp" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1620-2160.webp" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2160-1620.webp" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1488-2266.webp" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2266-1488.webp" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1320-2868.webp" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2868-1320.webp" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1206-2622.webp" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2622-1206.webp" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1260-2736.webp" media="(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2736-1260.webp" media="(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1290-2796.webp" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2796-1290.webp" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1179-2556.webp" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2556-1179.webp" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1170-2532.webp" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2532-1170.webp" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1284-2778.webp" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2778-1284.webp" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1125-2436.webp" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2436-1125.webp" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1242-2688.webp" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2688-1242.webp" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-828-1792.webp" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1792-828.webp" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1242-2208.webp" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-2208-1242.webp" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-750-1334.webp" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1334-750.webp" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-640-1136.webp" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/images/splash/apple-splash-1136-640.webp" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">


        @fonts

        <script>
            window.deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new Event('pwa-installable'));
            });
        </script>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
