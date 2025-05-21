'use client';

import { getDefaultPhoto, isRestricted } from '@/lib/client.action';
import { UserDocument } from '@/models/user.schema';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Image } from 'primereact/image';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import React, { useEffect, useState } from 'react';

const UserList = () => {
    const [list, setList] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const router = useRouter();
    const { data: session } = useSession();

    const nameBodyTemplate = (rowData: UserDocument) => (
        <Link href={`/user/${rowData._id}`}>
            <Image alt="profile picture" src={rowData?.photo || getDefaultPhoto()} width="32" height="32" style={{ verticalAlign: 'middle' }} imageStyle={{ borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ marginLeft: '.5em', verticalAlign: 'middle' }}>{rowData.name}</span>
        </Link>
    );
    const statusBodyTemplate = (rowData: UserDocument) => <Tag value={rowData.active ? 'AKTIF' : 'TIDAK AKTIF'} severity={rowData.active ? 'info' : 'warning'} />;
    const editBodyTemplate = (rowData: UserDocument) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/user/${rowData._id}`)} />;

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
                <Button type="button" icon="pi pi-users" label="Tambah" outlined onClick={() => router.push('/user/baru')} />
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
                const response = await fetch('/api/user', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                setList(await response.json());
            } catch (_) {}

            setLoading(false);
            initFilters();
        };

        setLoading(true);
        fetching();
    }, []);

    useEffect(() => {
        if (session) {
            const { disabled } = isRestricted(session);

            if (disabled) {
                router.replace('/');
            }
        }
    }, [router, session]);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Tabel Akun</h5>
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
                        <Column field="username" header="Username" />
                        <Column field="phone" header="Telepon/HP" />
                        <Column field="address" header="Alamat" />
                        <Column field="privilege" header="Hak Akses" />
                        <Column header="Status" body={statusBodyTemplate} />
                        <Column header="" body={editBodyTemplate} className="filter-action-button" />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default UserList;
