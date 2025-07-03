'use client';

import { TableByReceipt } from '@/component/item/receipt/invoice.table';
import { TableByItem } from '@/component/item/receipt/item.table';
import { calculateSumCost } from '@/lib/client.action';
import { ReceiptDocument } from '@/models/receipt.schema';
import { getList } from '@/queries/get';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTableFilterMeta } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useEffect, useRef, useState } from 'react';

dayjs.extend(isBetween);

const processInvoiceItem = ({ date, author, supplier, reference, products, _id }: ReceiptDocument) => {
    const datetime = date || author.created?.time || null;

    if (datetime) {
        return { _id, supplier, author, date: datetime, cost: calculateSumCost(products), reference: reference ?? String(_id).toUpperCase() };
    }

    return null;
};

const processProductItem = (item: any) => ({ ...item, cost: item.cost ?? 0, discount: item.discount ?? 0 });

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

const processReceiptData = (result: ReceiptDocument[], dates: (Date | null)[] | null): { receipt: any[]; product: any[] } => {
    let receipts = processInvoiceData(result);
    let products = processProductData(result);

    if (dates?.length === 2) {
        receipts = receipts.filter(({ date }) => (dates?.at(1) ? dayjs(date).isBetween(dayjs(dates[0]), dayjs(dates[1]), 'days', '[]') : dayjs(date).isSame(dayjs(dates[0]), 'day')));
        products = products.filter(({ date }) => (dates?.at(1) ? dayjs(date).isBetween(dayjs(dates[0]), dayjs(dates[1]), 'days', '[]') : dayjs(date).isSame(dayjs(dates[0]), 'day')));
    }

    return { receipt: receipts, product: products };
};

const ReceiptList = () => {
    const [modePreview, setModePreview] = useState<'produk' | 'faktur'>('produk');
    const [list, setList] = useState<{ product: any[]; receipt: any[] }>({ receipt: [], product: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [dateFilter, setDateFilter] = useState<(Date | null)[] | null>(null);
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
                const result: ReceiptDocument[] = await getList('receipt');
                setList(processReceiptData(result, dateFilter));
            } catch (_) {
                console.error(_);
            }

            setLoading(false);
            initFilters();
        };

        setLoading(true);
        fetching();
    }, [dateFilter]);

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
                    <p>Menampilkan data berdasarkan {modePreview === 'produk' ? 'Produk' : 'Faktur'}</p>
                    {modePreview === 'produk' ? (
                        <TableByItem list={list.product} filters={filters} globalFilterValue={globalFilterValue} onGlobalFilterChange={onGlobalFilterChange} dateFilter={dateFilter} setDateFilter={setDateFilter} loading={loading} />
                    ) : (
                        <TableByReceipt list={list.receipt} filters={filters} globalFilterValue={globalFilterValue} onGlobalFilterChange={onGlobalFilterChange} dateFilter={dateFilter} setDateFilter={setDateFilter} loading={loading} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptList;
