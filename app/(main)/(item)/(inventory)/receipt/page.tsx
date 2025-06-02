'use client';

import { TableByReceipt } from '@/component/item/receipt/invoice.table';
import { TableByItem } from '@/component/item/receipt/item.table';
import { ReceiptDocument } from '@/models/receipt.schema';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTableFilterMeta } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useEffect, useRef, useState } from 'react';

const calculateSumCost = (products: any[]) => {
    let sumCost = 0;
    products.forEach((item) => (sumCost += item?.cost || (item.product as any)?.cost || 0));

    return sumCost;
};

const processInvoiceItem = ({ date, author, supplier, reference, products, _id }: ReceiptDocument) => {
    const datetime = date || author.created?.time || null;

    if (datetime) {
        return { _id, supplier, author, date: datetime, cost: calculateSumCost(products), reference: reference || String(_id).toUpperCase() };
    }

    return null;
};

const processProductItem = (item: any) => ({ ...item, cost: item.cost || (item.product as any)?.cost || 0, discount: item.discount || (item.product as any)?.discount || 0 });

const processProductData = (result: ReceiptDocument[]): any[] => {
    const product: any[] = [];

    result.forEach(({ _id, date, author, products }) => {
        const datetime = date || author.created?.time || null;

        if (datetime) {
            products.forEach((item) => product.push({ ...processProductItem(item), author, date: datetime, parent: _id }));
        }
    });

    return product;
};

const processInvoiceData = (result: ReceiptDocument[]): any[] => {
    const receipt: any[] = [];

    result.forEach((item) => {
        const processedItem = processInvoiceItem(item);

        if (processedItem) {
            receipt.push(processedItem);
        }
    });

    return receipt;
};

const processReceiptData = (result: ReceiptDocument[]): { receipt: any[]; product: any[] } => ({ receipt: processInvoiceData(result), product: processProductData(result) });

const ReceiptList = () => {
    const [modePreview, setModePreview] = useState<'produk' | 'faktur'>('produk');
    const [list, setList] = useState<{ product: any[]; receipt: any[] }>({ receipt: [], product: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const modeMenu = useRef<Menu>(null);

    const initFilters = () => {
        setGlobalFilterValue('');
        setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filtered = { ...filters };
        (_filtered['global'] as any).value = value;

        setFilters(_filtered);
        setGlobalFilterValue(value);
    };

    useEffect(() => {
        const fetching = async () => {
            try {
                const response = await fetch('/api/receipt', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                const result: ReceiptDocument[] = await response.json();
                setList(processReceiptData(result));
            } catch (_) {}

            setLoading(false);
            initFilters();
        };

        setLoading(true);
        fetching();
    }, []);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center">
                        <h5>Tabel Barang Masuk</h5>
                        <div>
                            <Button rounded text icon="pi pi-ellipsis-v" className="p-button-plain" tooltip="Menampilkan data berdasarkan ..." tooltipOptions={{ position: 'left' }} onClick={(e) => modeMenu.current?.toggle(e)} />
                            <Menu
                                popup
                                ref={modeMenu}
                                model={[
                                    { label: 'Produk', icon: 'pi pi-fw pi-box', command: () => setModePreview('produk') },
                                    { label: 'Faktur', icon: 'pi pi-fw pi-file', command: () => setModePreview('faktur') }
                                ]}
                            />
                        </div>
                    </div>
                    <p>
                        Berdasarkan {modePreview === 'produk' ? 'Produk' : 'Faktur'} <mark>untuk merubah, klik tombol &#8942;</mark>
                    </p>
                    {modePreview === 'produk' ? (
                        <TableByItem list={list.product} filters={filters} globalFilterValue={globalFilterValue} loading={loading} onGlobalFilterChange={onGlobalFilterChange} />
                    ) : (
                        <TableByReceipt list={list.receipt} filters={filters} globalFilterValue={globalFilterValue} loading={loading} onGlobalFilterChange={onGlobalFilterChange} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptList;
