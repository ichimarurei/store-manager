'use client';

import CartForm from '@/component/item/receipt/cart.form';
import InvoiceForm from '@/component/item/receipt/invoice.form';
import ItemForm from '@/component/item/receipt/item.form';
import { toaster } from '@/lib/client.action';
import { ProductDocument } from '@/models/product.schema';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    reference: validator.nullish(validator.string(), ''),
    supplier: validator.nullish(validator.string(), ''),
    date: validator.nullish(validator.date(), null),
    operator: validator.pipe(validator.string('Nama operator/admin harus berupa huruf'), validator.nonEmpty('Nama operator/admin harus diisi')),
    products: validator.pipe(
        validator.array(
            validator.object({
                product: validator.string('Produk harus diisi'),
                unit: validator.string('Satuan harus diisi'),
                qty: validator.number('Jumlah harus diisi'),
                cost: validator.number('Harga beli harus diisi'),
                discount: validator.nullish(validator.number('Diskon harus berupa angka'), 0)
            })
        ),
        validator.nonEmpty('Barang masuk harus diisi')
    ),
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
            const response = await fetch(_id ? `/api/receipt/${_id}` : '/api/receipt', {
                method: !_id ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            const result = await response.json();
            saved = result?.saved ?? false;
        } catch (_) {
            console.error(_);
        }
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const fetchProducts = async (): Promise<any[]> => {
    const products: ProductDocument[] = [];

    try {
        const response = await fetch('/api/product', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
        const list = await response.json();
        products.push(...list);
    } catch (_) {
        console.error(_);
    }

    return products;
};

const parserCart = (carts: any[]) => carts.filter(({ product }) => product !== null).map(({ product, qty, unit, cost, discount }) => ({ qty, cost, discount, unit, item: product, label: product?.name, key: uuid() }));

const Contents = ({ record }: { record: any }) => {
    const [list, setList] = useState<ProductDocument[]>([]);
    const [carts, setCarts] = useState<any[]>([]);

    const addToCart = (selected: any) => setCarts([...carts, { ...selected, label: selected?.item?.name, key: uuid() }]);

    const normalizeCart = () => carts.map(({ item, qty, unit, cost, discount }) => ({ product: item?._id, qty, unit, cost, discount }));

    const getProducts = async () => setList(await fetchProducts());

    const initializeCart = (record: any) => setCarts(parserCart(record?.products ?? []));

    useEffect(() => {
        getProducts();
    }, []);

    useEffect(() => {
        initializeCart(record);
    }, [record]);

    return (
        <>
            <div className="md:col-9 col-12">
                <ItemForm mode={record?._id ? 'edit' : 'add'} record={record} addToCart={addToCart} list={list} getProducts={getProducts} />
            </div>
            <div className="md:col-3 col-12">
                <CartForm selected={carts} setSelected={setCarts} />
                <InvoiceForm mode={record?._id ? 'edit' : 'add'} record={record} doSubmit={doSubmit} products={normalizeCart()} />
            </div>
        </>
    );
};

const ReceiptPanel = ({ params }: { params: Promise<{ _id: string }> }) => {
    const [record, setRecord] = useState<any>();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);

    useEffect(() => {
        const fetching = async () => {
            try {
                const { _id } = await params;

                if (_id && _id !== 'baru') {
                    const response = await fetch(`/api/receipt/${_id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                    setRecord(await response.json());
                }

                setLoading(false);
            } catch (_) {
                console.error(_);
                toaster(toast.current, [{ severity: 'error', summary: 'Gagal memuat data!', detail: 'Data tidak dapat dimuat oleh Sistem' }], 'receipt');
            }
        };

        setLoading(true);
        fetching();
    }, [params]);

    return (
        <div className="grid">
            {loading ? <Skeleton className="w-full h-screen" /> : <Contents record={record} />}
            <Toast ref={toast} />
        </div>
    );
};

export default ReceiptPanel;
