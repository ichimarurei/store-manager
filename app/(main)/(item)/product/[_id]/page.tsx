'use client';

import ProductForm from '@/component/item/product/form';
import { toaster } from '@/lib/client.action';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    name: validator.pipe(validator.string('Nama produk harus berupa huruf'), validator.nonEmpty('Nama produk harus diisi'), validator.minLength(2, 'Nama produk minimal 2 huruf')),
    category: validator.pipe(validator.string(), validator.nonEmpty('Kategori produk harus diisi')),
    unit: validator.pipe(validator.string(), validator.nonEmpty('Satuan produk harus diisi')),
    cost: validator.number('Harga produk harus diisi'),
    operator: validator.pipe(validator.string('Nama operator/admin harus berupa huruf'), validator.nonEmpty('Nama operator/admin harus diisi')),
    discount: validator.nullish(validator.number('Diskon dari supplier harus berupa angka'), 0),
    images: validator.nullish(validator.array(validator.string('Gambar produk harus valid')), []),
    bundle: validator.nullish(validator.object({ contain: validator.object({ amount: validator.number('Jumlah bundel harus berupa angka'), unit: validator.string('Satuan bundel harus diisi') }) }), null),
    author: validator.nullish(
        validator.object({
            created: validator.object({
                by: validator.pipe(validator.string('Nama operator/admin harus berupa huruf'), validator.nonEmpty('Nama operator/admin harus diisi')),
                time: validator.date('Tanggal pembuatan harus valid')
            })
        }),
        null
    )
});

const doSubmit = async (record: any, _id?: string) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadSchema, record, { abortPipeEarly: true });

    if (validated.success) {
        try {
            const response = await fetch(`/api/product${_id ? `/${_id}` : ''}`, {
                method: !_id ? 'POST' : 'PUT',
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

const ProductPage = ({ params }: { params: Promise<{ _id: string }> }) => {
    const [id, setId] = useState('baru');
    const [record, setRecord] = useState();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);

    useEffect(() => {
        const fetching = async () => {
            try {
                const { _id } = await params;

                if (_id && _id !== 'baru') {
                    const response = await fetch(`/api/product/${_id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                    setRecord(await response.json());
                }

                setId(_id);
                setLoading(false);
            } catch (_) {
                toaster(toast.current, [{ severity: 'error', summary: 'Gagal memuat data!', detail: 'Data tidak dapat dimuat oleh Sistem' }], 'product');
            }
        };

        setLoading(true);
        fetching();
    }, [params]);

    return (
        <div className="grid">
            <div className="col-12">{loading ? <Skeleton className="w-full h-screen" /> : <ProductForm record={record} toast={toast.current} doSubmit={doSubmit} mode={id === 'baru' ? 'add' : 'edit'} />}</div>
            <Toast ref={toast} />
        </div>
    );
};

export default ProductPage;
