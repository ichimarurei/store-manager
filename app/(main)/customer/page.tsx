'use client';

import { CustomerDocument } from '@/models/customer.schema';
import { getList } from '@/queries/get';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';

const CustomerList = () => {
    const [list, setList] = useState<CustomerDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const router = useRouter();

    const nameBodyTemplate = (rowData: CustomerDocument) => <Link href={`/customer/${rowData._id}`}>{rowData.name}</Link>;
    const editBodyTemplate = (rowData: CustomerDocument) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/customer/${rowData._id}`)} />;

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
                <Button type="button" icon="pi pi-user" label="Tambah" outlined onClick={() => router.push('/customer/baru')} />
                <span className="p-input-icon-left filter-input–table">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
                </span>
            </div>
        );
    };

    useEffect(() => {
        const fetching = async () => {
            setList(await getList('customer'));
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
                    <h5>Tabel Pelanggan</h5>
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
                        <Column field="city" header="Kota" />
                        <Column header="" body={editBodyTemplate} className="filter-action-button" />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
