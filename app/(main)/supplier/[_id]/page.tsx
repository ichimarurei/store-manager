'use client';

import SupplierForm from '@/component/supplier/form';
import { toaster } from '@/lib/client.action';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    name: validator.pipe(validator.string('Nama supplier harus berupa huruf'), validator.nonEmpty('Nama supplier harus diisi'), validator.minLength(2, 'Nama supplier minimal 2 huruf')),
    address: validator.nullish(validator.string(), ''),
    phone: validator.nullish(validator.string(), '')
});

const doSubmit = async (record: any, _id?: string) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadSchema, record, { abortPipeEarly: true });

    if (validated.success) {
        try {
            const response = await fetch(`/api/supplier${_id ? `/${_id}` : ''}`, {
                method: !_id ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            const result = await response.json();
            saved = result?.saved || false;
        } catch (_) {
            console.error(_);
        }
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const SupplierPage = ({ params }: { params: Promise<{ _id: string }> }) => {
    const [id, setId] = useState('baru');
    const [record, setRecord] = useState();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);

    useEffect(() => {
        const fetching = async () => {
            try {
                const { _id } = await params;

                if (_id && _id !== 'baru') {
                    const response = await fetch(`/api/supplier/${_id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                    setRecord(await response.json());
                }

                setId(_id);
                setLoading(false);
            } catch (_) {
                toaster(toast.current, [{ severity: 'error', summary: 'Gagal memuat data!', detail: 'Data tidak dapat dimuat oleh Sistem' }], 'supplier');
            }
        };

        setLoading(true);
        fetching();
    }, [params]);

    return (
        <div className="grid">
            <div className="col-12">{loading ? <Skeleton className="w-full h-screen" /> : <SupplierForm record={record} toast={toast.current} doSubmit={doSubmit} mode={id === 'baru' ? 'add' : 'edit'} />}</div>
            <Toast ref={toast} />
        </div>
    );
};

export default SupplierPage;
