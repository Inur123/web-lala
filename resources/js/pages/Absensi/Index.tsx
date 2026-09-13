import { Head, Link, router } from '@inertiajs/react';
import { CalendarClock, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';

type AttendanceSession = {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    attendances_count: number;
    present_count: number;
};

export default function AbsensiIndex({
    sessions,
}: {
    sessions: AttendanceSession[];
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(
            '/absensi',
            { name, description },
            {
                onSuccess: () => {
                    toast.success('Sesi absensi berhasil dibuat');
                    setIsDialogOpen(false);
                    setName('');
                    setDescription('');
                },
                onError: () => toast.error('Gagal membuat sesi absensi'),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDelete = (id: string) => {
        router.delete(`/absensi/${id}`, {
            onSuccess: () => toast.success('Sesi absensi berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus sesi absensi'),
        });
    };

    return (
        <>
            <Head title="Absensi Peserta" />

            <div className="flex w-full flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Absensi Peserta
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola sesi kehadiran untuk peserta yang telah lolos
                            screening.
                        </p>
                    </div>

                    <div className="w-full sm:w-auto">
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="h-10 w-full justify-center font-semibold shadow-sm sm:w-auto">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Sesi Absensi
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Buat Sesi Absensi
                                        </DialogTitle>
                                        <DialogDescription>
                                            Buat sesi kehadiran baru. Semua
                                            peserta yang berstatus Lolos
                                            Screening akan otomatis masuk ke
                                            dalam sesi ini.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Nama Sesi{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                placeholder="Contoh: Absensi Hari 1 (Pagi)"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Keterangan (Opsional)
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={description}
                                                onChange={(e) =>
                                                    setDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Catatan tambahan"
                                                maxLength={1000}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmitting
                                                ? 'Menyimpan...'
                                                : 'Buat Sesi'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.length === 0 ? (
                        <Card className="bg-muted/20 col-span-full border-dashed">
                            <CardContent className="p-12 text-center">
                                <CalendarClock className="text-muted-foreground/40 mx-auto h-12 w-12" />
                                <h3 className="mt-4 text-sm font-semibold">
                                    Belum ada sesi absensi
                                </h3>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Mulai dengan membuat sesi absensi baru.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        sessions.map((session) => (
                            <Card
                                key={session.id}
                                className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md"
                            >
                                <CardHeader className="p-5">
                                    <CardTitle
                                        className="line-clamp-1"
                                        title={session.name}
                                    >
                                        {session.name}
                                    </CardTitle>
                                    {session.description && (
                                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                            {session.description}
                                        </p>
                                    )}
                                    <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            <strong className="text-foreground">
                                                {session.present_count}
                                            </strong>{' '}
                                            / {session.attendances_count} Hadir
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardFooter className="bg-muted/30 flex items-center justify-between border-t px-5 py-3">
                                    <span className="text-muted-foreground text-xs">
                                        {formatDate(
                                            session.created_at,
                                            'short',
                                        )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                    aria-label={`Hapus sesi ${session.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Hapus Sesi Absensi?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Apakah Anda yakin ingin
                                                        menghapus sesi{' '}
                                                        <strong>
                                                            {session.name}
                                                        </strong>
                                                        ? Semua data kehadiran
                                                        pada sesi ini akan ikut
                                                        terhapus.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">
                                                            Batal
                                                        </Button>
                                                    </DialogClose>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                session.id,
                                                            )
                                                        }
                                                    >
                                                        Ya, Hapus
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 text-xs"
                                            asChild
                                        >
                                            <Link
                                                href={`/absensi/${session.id}`}
                                            >
                                                Buka & Pindai
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

AbsensiIndex.layout = {
    breadcrumbs: [{ title: 'Absensi Peserta', href: '/absensi' }],
};
