'use client';

import CartForm from '@/component/item/sales/cart.form';
import InvoiceForm from '@/component/item/sales/invoice.form';
import ItemForm from '@/component/item/sales/item.form';
import { toaster } from '@/lib/client.action';
import { ProductDocument } from '@/models/product.schema';
import { submitting } from '@/mutations/submit';
import { getData, getList } from '@/queries/get';
import { orderBy } from 'lodash';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    reference: validator.nullish(validator.string(), ''),
    customer: validator.nullish(validator.string(), ''),
    date: validator.nullish(validator.date(), null),
    operator: validator.pipe(validator.string('Nama operator/admin harus berupa huruf'), validator.nonEmpty('Nama operator/admin harus diisi')),
    subPrice: validator.number('Sub total harus diisi'),
    finalPrice: validator.number('Total harga harus diisi'),
    paid: validator.number('Jumlah bayar harus diisi'),
    change: validator.nullish(validator.number('Kembalian harus berupa angka'), 0),
    tax: validator.nullish(validator.number('PPN harus berupa angka'), 0),
    products: validator.pipe(
        validator.array(
            validator.object({
                product: validator.string('Produk harus diisi'),
                price: validator.number('Harga jual harus diisi'),
                discount: validator.nullish(validator.number('Diskon penjualan harus berupa angka'), 0),
                salesQty: validator.object({
                    unit: validator.string('Satuan harus diisi'),
                    qty: validator.number('Jumlah harus diisi')
                }),
                bonusQty: validator.nullish(
                    validator.object({
                        unit: validator.string('Satuan harus diisi'),
                        qty: validator.number('Jumlah harus diisi')
                    }),
                    null
                )
            })
        ),
        validator.nonEmpty('Barang keluar harus diisi')
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
        saved = await submitting('sales', record, _id);
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const fetchProducts = async (): Promise<any[]> => {
    const products: ProductDocument[] = [];

    try {
        const list = await getList('stock');
        products.push(...list);
    } catch (_) {
        console.error(_);
    }

    return orderBy(products, ['name', 'inventory'], ['asc', 'desc']);
};

const parserCart = (carts: any[]) =>
    carts.filter(({ product }) => product !== null).map(({ product, salesQty, bonusQty, price, discount }) => ({ discount, cost: price, sales: salesQty, bonus: bonusQty, item: product, label: product?.name, key: uuid() }));

const Contents = ({ record }: { record: any }) => {
    const [list, setList] = useState<ProductDocument[]>([]);
    const [carts, setCarts] = useState<any[]>([]);

    const addToCart = (selected: any) => setCarts([...carts, { ...selected, label: selected?.item?.name, key: uuid() }]);

    const normalizeCart = () =>
        carts.map(({ item, cost, sales, bonus, discount }) => ({
            product: item?._id,
            price: cost,
            salesQty: sales,
            bonusQty: bonus?.unit && bonus?.qty > 0 ? bonus : null,
            discount
        }));

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
            <div className="md:col-6 col-12">
                <ItemForm mode={record?._id ? 'edit' : 'add'} record={record} addToCart={addToCart} list={list} getProducts={getProducts} />
            </div>
            <div className="md:col-3 col-12">
                <CartForm selected={carts} setSelected={setCarts} />
            </div>
            <div className="md:col-3 col-12">
                <InvoiceForm mode={record?._id ? 'edit' : 'add'} record={record} doSubmit={doSubmit} products={normalizeCart()} />
            </div>
        </>
    );
};

const SalesPanel = ({ params }: { params: Promise<{ _id: string }> }) => {
    const [record, setRecord] = useState<any>();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);

    useEffect(() => {
        const fetching = async () => {
            try {
                const { _id } = await params;

                if (_id && _id !== 'baru') {
                    setRecord(await getData('sales', _id));
                }

                setLoading(false);
            } catch (_) {
                console.error(_);
                toaster(toast.current, [{ severity: 'error', summary: 'Gagal memuat data!', detail: 'Data tidak dapat dimuat oleh Sistem' }], 'sales');
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

export default SalesPanel;
