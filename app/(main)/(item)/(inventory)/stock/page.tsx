'use client';

import { getDefaultProduct, processRangePrice } from '@/lib/client.action';
import { doSyncStock } from '@/lib/server.action';
import { ProductDocument } from '@/models/product.schema';
import { getList } from '@/queries/get';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Image } from 'primereact/image';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const ProductList = () => {
    const [list, setList] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const toast = useRef<Toast | null>(null);

    const nameBodyTemplate = (rowData: ProductDocument) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image alt="product image" src={rowData?.images?.at(0) ?? getDefaultProduct()} width="32" height="32" style={{ verticalAlign: 'middle' }} imageStyle={{ borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ marginLeft: '.5em', verticalAlign: 'middle' }}>{rowData.name}</span>
        </div>
    );
    const stockBodyTemplate = (rowData: any) => (rowData?.inventory ? `${Intl.NumberFormat('id-ID', { style: 'decimal' }).format(rowData.inventory)} ${rowData?.unit?.name ?? ''}` : '');
    const bundleBodyTemplate = (rowData: any) => (rowData?.bundle?.node && rowData?.bundle?.contain ? `${rowData.bundle.node?.amount} ${rowData.bundle.node?.unit?.name} = ${rowData.bundle.contain?.amount} ${rowData.bundle.contain?.unit?.name}` : '');
    const costBodyTemplate = ({ cost }: ProductDocument) => processRangePrice(cost ?? []);

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

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between flex-wrap">
                <span className="p-input-icon-left filter-input–table">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
                </span>
            </div>
        );
    };

    const syncStock = async () => {
        try {
            toast.current?.show({ severity: 'info', summary: 'Sinkronisasi Stok', detail: 'Memproses sinkronisasi stok produk ...' });
            setLoading(true);

            if (await doSyncStock()) {
                window.location.reload();
            }
        } catch (_) {
            console.error(_);
            toast.current?.show({ severity: 'warn', summary: 'Gagal sinkron stok!', detail: 'Data stok tidak dapat disinkronisasi !' });
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetching = async () => {
            setList(await getList('stock'));
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
                    <div className="flex align-items-center justify-content-between">
                        <h5>Tabel Stok Produk</h5>
                        <Button aria-label="Sinkron stok" icon="pi pi-sync" rounded text severity="help" onClick={async () => await syncStock()} tooltip="Sinkron stok" tooltipOptions={{ position: 'left' }} />
                    </div>
                    <p>Stok yang ditampilkan menggunakan total aktual dalam satuan terkecilnya</p>
                    <DataTable
                        className="p-datatable-gridlines"
                        header={renderHeader}
                        loading={loading}
                        filters={filters}
                        value={list}
                        rows={10}
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                        currentPageReportTemplate="Menampilkan {first} - {last} , dari total {totalRecords} data"
                        dataKey="id"
                        filterDisplay="menu"
                        emptyMessage="Data kosong/tidak ditemukan!"
                        paginator
                        showGridlines
                        stripedRows
                        scrollable
                    >
                        <Column header="Nama" filterField="name" body={nameBodyTemplate} />
                        <Column header="Kategori" field="category.name" />
                        <Column header="Satuan" field="unit.name" />
                        <Column header="Bundel" body={bundleBodyTemplate} />
                        <Column header="Stok" filterField="inventory" body={stockBodyTemplate} />
                        <Column header="Modal" filterField="cost" body={costBodyTemplate} />
                    </DataTable>
                </div>
            </div>
            <Toast ref={toast} />
        </div>
    );
};

export default ProductList;
