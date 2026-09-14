import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'Logo LATIN LATPEL PC IPNU IPPNU Magetan',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo-lala.webp"
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
