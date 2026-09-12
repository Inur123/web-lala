import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div
            className="min-h-screen bg-white text-gray-900"
            data-layout="public"
        >
            {children}
        </div>
    );
}
