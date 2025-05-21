'use client';

import { SupplierDocument } from '@/models/supplier.schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';

const SupplierList = () => {
    const [list, setList] = useState<SupplierDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const router = useRouter();

    const nameBodyTemplate = (rowData: SupplierDocument) => <Link href={`/supplier/${rowData._id}`}>{rowData.name}</Link>;
    const editBodyTemplate = (rowData: SupplierDocument) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/supplier/${rowData._id}`)} />;

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
                <Button type="button" icon="pi pi-truck" label="Tambah" outlined onClick={() => router.push('/supplier/baru')} />
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
                const response = await fetch('/api/supplier', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                setList(await response.json());
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
                    <h5>Tabel Supplier</h5>
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
                        <Column field="phone" header="Telepon/HP" />
                        <Column field="address" header="Alamat" />
                        <Column header="" body={editBodyTemplate} className="filter-action-button" />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default SupplierList;
