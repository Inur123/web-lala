export function fileUrl(fileId: string): string {
    return `/files/${encodeURIComponent(fileId)}`;
}
