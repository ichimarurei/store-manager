'use client';

import CustomerForm from '@/component/customer/form';
import { toaster } from '@/lib/client.action';
import { submitting } from '@/mutations/submit';
import { getData } from '@/queries/get';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    name: validator.pipe(validator.string('Nama pelanggan harus berupa huruf'), validator.nonEmpty('Nama pelanggan harus diisi'), validator.minLength(2, 'Nama pelanggan minimal 2 huruf')),
    address: validator.nullish(validator.string(), ''),
    city: validator.nullish(validator.string(), ''),
    phone: validator.nullish(validator.string(), '')
});

const doSubmit = async (record: any, _id?: string) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadSchema, record, { abortPipeEarly: true });

    if (validated.success) {
        saved = await submitting('customer', record, _id);
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const CustomerPage = ({ params }: { params: Promise<{ _id: string }> }) => {
    const [id, setId] = useState('baru');
    const [record, setRecord] = useState();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);

    useEffect(() => {
        const fetching = async () => {
            try {
                const { _id } = await params;

                if (_id && _id !== 'baru') {
                    setRecord(await getData('customer', _id));
                }

                setId(_id);
                setLoading(false);
            } catch (_) {
                console.error(_);
                toaster(toast.current, [{ severity: 'error', summary: 'Gagal memuat data!', detail: 'Data tidak dapat dimuat oleh Sistem' }], 'customer');
            }
        };

        setLoading(true);
        fetching();
    }, [params]);

    return (
        <div className="grid">
            <div className="col-12">{loading ? <Skeleton className="w-full h-screen" /> : <CustomerForm record={record} toast={toast.current} doSubmit={doSubmit} mode={id === 'baru' ? 'add' : 'edit'} />}</div>
            <Toast ref={toast} />
        </div>
    );
};

export default CustomerPage;
