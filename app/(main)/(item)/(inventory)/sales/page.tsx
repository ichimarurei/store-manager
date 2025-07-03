'use client';

import { TableBySales } from '@/component/item/sales/invoice.table';
import { TableByItem } from '@/component/item/sales/item.table';
import { SalesDocument } from '@/models/sales.schema';
import { getList } from '@/queries/get';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTableFilterMeta } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';

dayjs.extend(isBetween);

const processInvoiceItem = ({ date, author, customer, reference, tax, finalPrice, _id }: SalesDocument) => {
    const datetime = date || author.created?.time || null;

    if (datetime) {
        return { _id, customer, author, date: datetime, cost: finalPrice, reference: reference ?? String(_id).toUpperCase(), tax: tax ?? 0 };
    }

    return null;
};

const processProductItem = (item: any) => ({ ...item, cost: item.price ?? 0, discount: item.discount ?? 0 });

const processProductData = (result: SalesDocument[]): any[] => {
    const product: any[] = [];

    result.forEach(({ _id, date, author, products }) => {
        const datetime = date || author.created?.time || null;

        if (datetime) {
            products.forEach((item) => product.push({ ...processProductItem(item), author, date: datetime, parent: _id }));
        }
    });

    return product;
};

const processInvoiceData = (result: SalesDocument[]): any[] => {
    const sales: any[] = [];

    result.forEach((item) => {
        const processedItem = processInvoiceItem(item);

        if (processedItem) {
            sales.push(processedItem);
        }
    });

    return sales;
};

const processSalesData = (result: SalesDocument[], dates: (Date | null)[] | null): { sales: any[]; product: any[] } => {
    let invoices = processInvoiceData(result);
    let products = processProductData(result);

    if (dates?.length === 2) {
        invoices = invoices.filter(({ date }) => (dates?.at(1) ? dayjs(date).isBetween(dayjs(dates[0]), dayjs(dates[1]), 'days', '[]') : dayjs(date).isSame(dayjs(dates[0]), 'day')));
        products = products.filter(({ date }) => (dates?.at(1) ? dayjs(date).isBetween(dayjs(dates[0]), dayjs(dates[1]), 'days', '[]') : dayjs(date).isSame(dayjs(dates[0]), 'day')));
    }

    return { sales: invoices, product: products };
};

const SalesList = () => {
    const [modePreview, setModePreview] = useState<'produk' | 'faktur'>('produk');
    const [list, setList] = useState<{ product: any[]; sales: any[] }>({ sales: [], product: [] });
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
                const result: SalesDocument[] = await getList('sales');
                setList(processSalesData(result, dateFilter));
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
                        <h5>Tabel Barang Keluar</h5>
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
                        <TableBySales list={list.sales} filters={filters} globalFilterValue={globalFilterValue} onGlobalFilterChange={onGlobalFilterChange} dateFilter={dateFilter} setDateFilter={setDateFilter} loading={loading} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesList;
