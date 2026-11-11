import {
    PesertaStagePage,
    type PesertaRegistrant,
} from '@/components/peserta/peserta-stage-page';

export default function PesertaAdministrasi({
    registrants,
}: {
    registrants: PesertaRegistrant[];
}) {
    return <PesertaStagePage stage="administrasi" registrants={registrants} />;
}

PesertaAdministrasi.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Peserta', href: '/peserta/administrasi' },
        { title: 'Peserta Administrasi', href: '/peserta/administrasi' },
    ],
};
