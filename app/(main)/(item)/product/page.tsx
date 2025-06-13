'use client';

import { getDefaultProduct } from '@/lib/client.action';
import { ProductDocument } from '@/models/product.schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Image } from 'primereact/image';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useState } from 'react';

const ProductList = () => {
    const [list, setList] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const router = useRouter();

    const nameBodyTemplate = (rowData: ProductDocument) => (
        <Link href={`/product/${rowData._id}`} style={{ display: 'flex', alignItems: 'center' }}>
            <Image alt="product image" src={rowData?.images?.at(0) || getDefaultProduct()} width="32" height="32" style={{ verticalAlign: 'middle' }} imageStyle={{ borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ marginLeft: '.5em', verticalAlign: 'middle' }}>{rowData.name}</span>
        </Link>
    );
    const editBodyTemplate = (rowData: ProductDocument) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/product/${rowData._id}`)} />;
    const bundleBodyTemplate = (rowData: any) => (rowData?.bundle?.node && rowData?.bundle?.contain ? `${rowData.bundle.node?.amount} ${rowData.bundle.node?.unit?.name} = ${rowData.bundle.contain?.amount} ${rowData.bundle.contain?.unit?.name}` : '');

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
                <Button type="button" icon="pi pi-box" label="Tambah" outlined onClick={() => router.push('/product/baru')} />
                <span className="p-input-icon-left filter-input–table">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
                </span>
            </div>
        );
    };

    useEffect(() => {
        const fetching = async () => {
            try {
                const response = await fetch('/api/product', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                setList(await response.json());
            } catch (_) {
                console.error(_);
            }

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
                    <h5>Tabel Produk</h5>
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
                        <Column header="Kategori" field="category.name" style={{ maxWidth: '6em' }} />
                        <Column header="Satuan" field="unit.name" style={{ maxWidth: '6em' }} />
                        <Column header="Bundel" body={bundleBodyTemplate} style={{ maxWidth: '8em' }} />
                        <Column header="" body={editBodyTemplate} className="filter-action-button" />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
