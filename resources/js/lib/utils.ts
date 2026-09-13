import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format tanggal & waktu standar aplikasi (sesuai konfigurasi .env: APP_TIMEZONE=Asia/Jakarta, APP_LOCALE=id).
 * Contoh: "Minggu, 13 September 2026 | 18.07 WIB"
 */
export function formatDateTime(
    dateStr: string | null | undefined,
    options?: { withDay?: boolean; withTime?: boolean },
): string {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';

        const withDay = options?.withDay ?? true;
        const withTime = options?.withTime ?? true;

        const datePart = new Intl.DateTimeFormat('id-ID', {
            ...(withDay ? { weekday: 'long' } : {}),
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
        }).format(date);

        if (!withTime) return datePart;

        const timePart = new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        })
            .format(date)
            .replace(':', '.');

        return `${datePart} | ${timePart} WIB`;
    } catch {
        return '-';
    }
}

/**
 * Format tanggal standar aplikasi (sesuai konfigurasi .env: APP_TIMEZONE=Asia/Jakarta, APP_LOCALE=id).
 * Contoh format 'long': "13 September 2026"
 * Contoh format 'short': "13 Sep 2026"
 */
export function formatDate(
    dateStr: string | null | undefined,
    format: 'long' | 'short' = 'long',
): string {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: format === 'short' ? 'short' : 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
        }).format(date);
    } catch {
        return '-';
    }
}

/**
 * Format jam standar aplikasi dengan zona WIB (sesuai konfigurasi .env: APP_TIMEZONE=Asia/Jakarta, APP_LOCALE=id).
 * Contoh: "18.07 WIB"
 */
export function formatTime(dateInput?: string | Date | null): string {
    try {
        const date = !dateInput
            ? new Date()
            : typeof dateInput === 'string'
              ? new Date(dateInput)
              : dateInput;
        if (isNaN(date.getTime())) return '-';
        const time = new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        })
            .format(date)
            .replace(':', '.');
        return `${time} WIB`;
    } catch {
        return '-';
    }
}
