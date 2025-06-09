'use client';

import CartForm from '@/component/item/receipt/cart.form';
import InvoiceForm from '@/component/item/receipt/invoice.form';
import ItemForm from '@/component/item/receipt/item.form';
import { ProductDocument } from '@/models/product.schema';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

const fetchProducts = async (): Promise<any[]> => {
    const products: ProductDocument[] = [];

    try {
        const response = await fetch('/api/product', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
        const list = await response.json();
        products.push(...list);
    } catch (_) {}

    return products;
};

const ReceiptByInvoice = () => {
    const [list, setList] = useState<ProductDocument[]>([]);
    const [carts, setCarts] = useState<any[]>([]);

    const addToCart = (selected: any) => setCarts([...carts, { ...selected, label: selected?.item?.name, key: uuid() }]);

    const getProducts = async () => setList(await fetchProducts());

    const doSubmit = async (record: any, _id?: string) => {
        let saved = false;
        let notices: string[] = [];

        try {
        } catch (_) {}

        return { saved, notices };
    };

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <div className="grid">
            <div className="md:col-9 col-12">
                <ItemForm mode="add" record={null} addToCart={addToCart} list={list} getProducts={getProducts} />
            </div>
            <div className="md:col-3 col-12">
                <CartForm selected={carts} setSelected={setCarts} />
                <InvoiceForm mode="add" record={null} doSubmit={doSubmit} />
            </div>
        </div>
    );
};

export default ReceiptByInvoice;
