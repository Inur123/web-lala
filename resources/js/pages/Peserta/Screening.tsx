import {
    PesertaStagePage,
    type PesertaRegistrant,
} from '@/components/peserta/peserta-stage-page';

export default function PesertaScreening({
    registrants,
}: {
    registrants: PesertaRegistrant[];
}) {
    return <PesertaStagePage stage="screening" registrants={registrants} />;
}

PesertaScreening.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Peserta', href: '/peserta/screening' },
        { title: 'Peserta Screening', href: '/peserta/screening' },
    ],
};
