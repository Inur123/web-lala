import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    AlertCircle,
    RefreshCw,
    SwitchCamera,
    Volume2,
    VolumeX,
    Zap,
    ZapOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrScannerProps {
    onScan: (decodedText: string) => Promise<void> | void;
    isProcessing?: boolean;
}

type FacingMode = 'environment' | 'user';
type CameraTarget = string | { facingMode: FacingMode };
type WindowWithWebkitAudio = Window & {
    webkitAudioContext?: typeof AudioContext;
};
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchConstraintSet = MediaTrackConstraintSet & { torch?: boolean };

function cameraError(error: unknown): { message: string; name: string } {
    if (error instanceof Error) {
        return error;
    }

    return { message: 'Terjadi kesalahan', name: '' };
}

export function QrScanner({ onScan, isProcessing = false }: QrScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const [cameras, setCameras] = useState<
        Array<{ id: string; label: string }>
    >([]);
    const [currentFacingMode, setCurrentFacingMode] =
        useState<FacingMode>('environment');
    const [activeCameraIndex, setActiveCameraIndex] = useState<number>(0);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const currentTrackRef = useRef<MediaStreamTrack | null>(null);
    const isLockedRef = useRef(false);
    const lastDecodedRef = useRef<string>('');
    const lastScanTimestampRef = useRef<number>(0);
    const isComponentMountedRef = useRef(true);
    const isProcessingRef = useRef(isProcessing);
    const onScanRef = useRef(onScan);
    const soundEnabledRef = useRef(soundEnabled);

    useEffect(() => {
        isProcessingRef.current = isProcessing;
        onScanRef.current = onScan;
        soundEnabledRef.current = soundEnabled;
    }, [isProcessing, onScan, soundEnabled]);

    // Audio chime synthesized using Web Audio API
    const playScanSound = useCallback(() => {
        if (!soundEnabledRef.current) return;
        try {
            const AudioCtx =
                window.AudioContext ||
                (window as WindowWithWebkitAudio).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            // Clean, quick confirmation beep (1000Hz)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.12,
            );
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.addEventListener(
                'ended',
                () => {
                    void ctx.close();
                },
                { once: true },
            );
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch {
            // AudioContext block handled
        }
    }, []);

    // Handle scan trigger with quick, reliable debounce
    const handleScannedText = useCallback(
        (decodedText: string) => {
            const now = Date.now();

            // Prevent firing while lock is active or parent is processing
            if (isLockedRef.current || isProcessingRef.current) {
                return;
            }

            // Anti-duplicate: Ignore the same QR if scanned within 2.5 seconds
            if (
                lastDecodedRef.current === decodedText &&
                now - lastScanTimestampRef.current < 2500
            ) {
                return;
            }

            // Fast rate-limit: 800ms minimum between scans for snappy queue flow
            if (now - lastScanTimestampRef.current < 800) {
                return;
            }

            // Lock synchronously
            isLockedRef.current = true;
            lastDecodedRef.current = decodedText;
            lastScanTimestampRef.current = now;

            playScanSound();

            if (navigator.vibrate) {
                try {
                    navigator.vibrate(60);
                } catch {
                    // Ignore vibration failure
                }
            }

            void Promise.resolve()
                .then(() => onScanRef.current(decodedText))
                .catch((scanError: unknown) => {
                    console.error(
                        'Pemrosesan hasil pemindaian gagal:',
                        scanError,
                    );
                })
                .finally(() => {
                    window.setTimeout(() => {
                        isLockedRef.current = false;
                    }, 300);
                });
        },
        [playScanSound],
    );

    // Clean up container DOM completely to prevent duplicate/tiled video feeds
    const purgeContainerDom = useCallback(() => {
        const container = document.getElementById('qr-reader');
        if (container) {
            container.replaceChildren();
        }
    }, []);

    // Stop current scanner safely
    const stopCurrentScanner = useCallback(async () => {
        if (currentTrackRef.current) {
            try {
                currentTrackRef.current.stop();
            } catch {
                // Ignore track stop error
            }
            currentTrackRef.current = null;
        }
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
            } catch (e) {
                console.warn('Scanner stop cleanup error (handled):', e);
            }
            html5QrCodeRef.current = null;
        }
        purgeContainerDom();
    }, [purgeContainerDom]);

    // Start scanner with target camera
    const startScanner = useCallback(
        async (cameraConfig: CameraTarget) => {
            try {
                setError(null);
                setIsCameraReady(false);
                setTorchOn(false);
                setTorchSupported(false);

                await stopCurrentScanner();

                if (!isComponentMountedRef.current) return;

                purgeContainerDom();

                const qrCode = new Html5Qrcode('qr-reader', {
                    verbose: false,
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true,
                    },
                });
                html5QrCodeRef.current = qrCode;

                await qrCode.start(
                    cameraConfig,
                    {
                        fps: 15,
                        // Full-frame scanning without center box restriction
                        qrbox: undefined,
                        aspectRatio: undefined,
                    },
                    (decodedText) => {
                        handleScannedText(decodedText);
                    },
                    () => {
                        // Frame scan had no QR, ignore
                    },
                );

                if (!isComponentMountedRef.current) {
                    await stopCurrentScanner();
                    return;
                }

                setIsCameraReady(true);
                setIsSwitching(false);

                // Detect torch capability
                try {
                    const videoEl = document.querySelector(
                        '#qr-reader video',
                    ) as HTMLVideoElement | null;
                    if (videoEl && videoEl.srcObject) {
                        const stream = videoEl.srcObject as MediaStream;
                        const track = stream.getVideoTracks()[0];
                        if (track) {
                            currentTrackRef.current = track;
                            const capabilities = (
                                track.getCapabilities
                                    ? track.getCapabilities()
                                    : {}
                            ) as TorchCapabilities;
                            if (capabilities && capabilities.torch) {
                                setTorchSupported(true);
                            }
                        }
                    }
                } catch {
                    setTorchSupported(false);
                }
            } catch (error: unknown) {
                const err = cameraError(error);
                console.error('Camera start failed:', error);
                setIsCameraReady(false);
                setIsSwitching(false);

                if (!isComponentMountedRef.current) return;

                if (
                    err.name === 'NotAllowedError' ||
                    err.name === 'PermissionDeniedError'
                ) {
                    setError(
                        'Izin kamera ditolak. Pastikan izin kamera telah diizinkan pada pengaturan browser Anda.',
                    );
                } else if (
                    err.name === 'NotFoundError' ||
                    err.name === 'OverconstrainedError'
                ) {
                    setError(
                        'Kamera tidak dapat diakses atau mode kamera ini tidak didukung pada perangkat ini.',
                    );
                } else if (
                    err.name === 'NotReadableError' ||
                    err.name === 'TrackStartError'
                ) {
                    setError(
                        'Kamera sedang digunakan oleh aplikasi/tab lain. Harap tutup aplikasi yang menggunakan kamera.',
                    );
                } else {
                    setError(
                        `Gagal memuat kamera: ${err.message || 'Terjadi kesalahan'}`,
                    );
                }
            }
        },
        [handleScannedText, purgeContainerDom, stopCurrentScanner],
    );

    // Flip / Switch Camera
    const switchCamera = useCallback(async () => {
        if (isSwitching) return;
        setIsSwitching(true);

        try {
            if (cameras.length > 1) {
                const nextIndex = (activeCameraIndex + 1) % cameras.length;
                setActiveCameraIndex(nextIndex);
                const nextCamera = cameras[nextIndex];
                await startScanner(nextCamera.id);
            } else {
                const nextMode: FacingMode =
                    currentFacingMode === 'environment'
                        ? 'user'
                        : 'environment';
                setCurrentFacingMode(nextMode);
                await startScanner({ facingMode: nextMode });
            }
        } catch (err) {
            console.error('Error switching camera:', err);
            setIsSwitching(false);
        }
    }, [
        isSwitching,
        cameras,
        activeCameraIndex,
        currentFacingMode,
        startScanner,
    ]);

    // Toggle flashlight
    const toggleTorch = useCallback(async () => {
        if (!currentTrackRef.current) return;
        try {
            const nextState = !torchOn;
            await currentTrackRef.current.applyConstraints({
                advanced: [{ torch: nextState } as TorchConstraintSet],
            });
            setTorchOn(nextState);
        } catch (e) {
            console.warn('Could not toggle torch', e);
        }
    }, [torchOn]);

    // Initialize on mount
    useEffect(() => {
        isComponentMountedRef.current = true;

        const init = async () => {
            try {
                try {
                    const tempStream =
                        await navigator.mediaDevices.getUserMedia({
                            video: true,
                        });
                    tempStream.getTracks().forEach((t) => t.stop());
                } catch {
                    // Handled by Html5Qrcode
                }

                if (!isComponentMountedRef.current) return;

                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    setCameras(devices);

                    let chosenIdx = 0;
                    const backIndex = devices.findIndex(
                        (d) =>
                            d.label.toLowerCase().includes('back') ||
                            d.label.toLowerCase().includes('belakang') ||
                            d.label.toLowerCase().includes('environment') ||
                            d.label.toLowerCase().includes('rear'),
                    );
                    if (backIndex !== -1) {
                        chosenIdx = backIndex;
                    }
                    setActiveCameraIndex(chosenIdx);
                    await startScanner(devices[chosenIdx].id);
                } else {
                    await startScanner({ facingMode: 'environment' });
                }
            } catch (error: unknown) {
                const err = cameraError(error);
                console.error('Initialization error:', error);
                if (isComponentMountedRef.current) {
                    setError(
                        `Gagal menginisialisasi kamera: ${err.message || 'Izin kamera dibutuhkan'}`,
                    );
                }
            }
        };

        void init();

        return () => {
            isComponentMountedRef.current = false;
            void stopCurrentScanner();
        };
    }, [startScanner, stopCurrentScanner]);

    const hasMultipleCameras = cameras.length > 1;
    const isMobileDevice =
        typeof navigator !== 'undefined' &&
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const canSwitch = hasMultipleCameras || isMobileDevice;

    return (
        <div className="relative flex h-full min-h-[380px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-zinc-900 shadow-sm select-none md:min-h-[460px] md:rounded-3xl">
            {/* CSS to ensure crisp, single video display without extra canvases */}
            <style>{`
                #qr-reader {
                    position: absolute !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                    background: transparent !important;
                    overflow: hidden !important;
                }
                #qr-reader video {
                    position: absolute !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: inherit !important;
                    z-index: 1 !important;
                }
                #qr-reader canvas,
                #qr-canvas {
                    display: none !important;
                    visibility: hidden !important;
                }
                #qr-reader video:not(:last-of-type) {
                    display: none !important;
                }
                #qr-reader__scan_region {
                    position: absolute !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: transparent !important;
                }
                #qr-reader__dashboard, #qr-reader img {
                    display: none !important;
                }
            `}</style>

            {/* Video container */}
            <div
                id="qr-reader"
                className="absolute inset-0 z-0 h-full w-full"
            ></div>

            {/* Corner brackets framing the scan target zone (cleanly separated below top controls) */}
            <div className="pointer-events-none absolute inset-x-5 top-16 bottom-5 z-10 flex flex-col justify-between md:inset-x-8 md:top-20 md:bottom-8">
                <div className="flex items-start justify-between">
                    <div className="h-7 w-7 rounded-tl-xl border-t-2 border-l-2 border-emerald-400 sm:h-8 sm:w-8"></div>
                    <div className="h-7 w-7 rounded-tr-xl border-t-2 border-r-2 border-emerald-400 sm:h-8 sm:w-8"></div>
                </div>
                <div className="flex items-end justify-between">
                    <div className="h-7 w-7 rounded-bl-xl border-b-2 border-l-2 border-emerald-400 sm:h-8 sm:w-8"></div>
                    <div className="h-7 w-7 rounded-br-xl border-r-2 border-b-2 border-emerald-400 sm:h-8 sm:w-8"></div>
                </div>
            </div>

            {/* Top Floating Control Bar */}
            <div className="pointer-events-auto absolute inset-x-3.5 top-3.5 z-20 flex items-center justify-between sm:inset-x-4 sm:top-4">
                {/* Live Status Pill */}
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        {isCameraReady && !isSwitching && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                            className={`relative inline-flex h-2 w-2 rounded-full ${
                                isSwitching
                                    ? 'bg-amber-400'
                                    : isProcessing
                                      ? 'animate-pulse bg-blue-400'
                                      : isCameraReady
                                        ? 'bg-emerald-500'
                                        : 'bg-zinc-500'
                            }`}
                        ></span>
                    </span>
                    <span>
                        {isSwitching
                            ? 'Beralih Kamera...'
                            : isProcessing
                              ? 'Memproses...'
                              : isCameraReady
                                ? 'Scanner Aktif'
                                : 'Memuat...'}
                    </span>
                </div>

                {/* Controls: Torch, Flip Camera, Sound */}
                <div className="flex items-center gap-1.5">
                    {/* Torch Toggle */}
                    {torchSupported && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleTorch}
                            aria-label={
                                torchOn
                                    ? 'Matikan lampu flash'
                                    : 'Nyalakan lampu flash'
                            }
                            title={
                                torchOn
                                    ? 'Matikan Lampu Flash'
                                    : 'Nyalakan Lampu Flash'
                            }
                            className={`h-8 w-8 rounded-full border backdrop-blur-md transition-all ${
                                torchOn
                                    ? 'border-amber-300 bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                                    : 'border-white/10 bg-black/50 text-white hover:bg-black/70'
                            }`}
                        >
                            {torchOn ? (
                                <Zap className="h-4 w-4 fill-current" />
                            ) : (
                                <ZapOff className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    {/* Camera Flip */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={switchCamera}
                        disabled={isSwitching || !canSwitch}
                        aria-label="Ganti kamera"
                        title={
                            !canSwitch
                                ? 'Perangkat ini hanya memiliki 1 kamera'
                                : `Ganti Kamera (${cameras.length > 1 ? `Kamera ${activeCameraIndex + 1}/${cameras.length}` : currentFacingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'})`
                        }
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all active:scale-95 ${
                            !canSwitch
                                ? 'cursor-not-allowed border-white/5 bg-black/30 text-white/40'
                                : isSwitching
                                  ? 'animate-pulse border-emerald-400 bg-emerald-600/60 text-white'
                                  : 'border-white/15 bg-black/50 text-white shadow hover:bg-black/70'
                        }`}
                    >
                        <SwitchCamera
                            className={`h-3.5 w-3.5 text-emerald-400 ${isSwitching ? 'animate-spin' : ''}`}
                        />
                        <span className="hidden sm:inline">
                            {cameras.length > 1
                                ? `Kamera (${activeCameraIndex + 1}/${cameras.length})`
                                : currentFacingMode === 'environment'
                                  ? 'Belakang'
                                  : 'Depan'}
                        </span>
                    </Button>

                    {/* Sound Mute/Unmute */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        aria-label={
                            soundEnabled
                                ? 'Matikan bunyi pemindai'
                                : 'Aktifkan bunyi pemindai'
                        }
                        title={
                            soundEnabled ? 'Bunyi Beep Aktif' : 'Bunyi Senyap'
                        }
                        className="h-8 w-8 rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                    >
                        {soundEnabled ? (
                            <Volume2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                            <VolumeX className="h-4 w-4 text-zinc-400" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Error Overlay with Clean Retry */}
            {error && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950/95 p-6 text-center backdrop-blur-md">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">
                        Akses Kamera Bermasalah
                    </h3>
                    <p className="mb-5 max-w-sm text-xs leading-relaxed text-zinc-400">
                        {error}
                    </p>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            if (cameras.length > 0) {
                                void startScanner(
                                    cameras[activeCameraIndex].id,
                                );
                            } else {
                                void startScanner({
                                    facingMode: currentFacingMode,
                                });
                            }
                        }}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-emerald-500 active:scale-95"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Coba Lagi
                    </Button>
                </div>
            )}
        </div>
    );
}
