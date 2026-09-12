export function fileUrl(key: string): string {
    const encodedKey = key
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

    return `/files/${encodedKey}`;
}
