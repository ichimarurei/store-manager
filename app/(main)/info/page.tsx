'use client';

import InfoForm from '@/component/info/form';
import { getDefaultLogo, isRestricted } from '@/lib/client.action';
import '@/styles/_form.scss';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    name: validator.pipe(validator.string('Nama profil usaha harus berupa huruf'), validator.nonEmpty('Nama profil usaha harus diisi'), validator.minLength(2, 'Nama profil usaha minimal 2 huruf')),
    address: validator.nullish(validator.string(), ''),
    logo: validator.nullish(validator.string(), getDefaultLogo()),
    line1: validator.nullish(validator.string(), ''),
    line2: validator.nullish(validator.string(), ''),
    customer: validator.nullish(validator.number(), 0),
    supplier: validator.nullish(validator.number(), 0)
});

const doSubmit = async (record: any) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadSchema, record, { abortPipeEarly: true });

    if (validated.success) {
        try {
            const response = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            const result = await response.json();
            saved = result?.saved || false;
        } catch (_) {}
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const InfoPage = () => {
    const [record, setRecord] = useState();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            const { disabled } = isRestricted(session);

            if (disabled) {
                router.replace('/');
            }
        }
    }, [router, session]);

    useEffect(() => {
        const fetching = async () => {
            try {
                const response = await fetch('/api/info', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                setRecord(await response.json());
                setLoading(false);
            } catch (_) {}
        };

        setLoading(true);
        fetching();
    }, []);

    return (
        <div className="grid">
            <div className="col-12">{loading ? <Skeleton className="w-full h-screen" /> : <InfoForm record={record} toast={toast.current} doSubmit={doSubmit} />}</div>
            <Toast ref={toast} />
        </div>
    );
};

export default InfoPage;
