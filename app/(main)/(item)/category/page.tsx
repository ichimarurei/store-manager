'use client';

import CategoryForm from '@/component/item/category/form';
import { CategoryDocument } from '@/models/category.schema';
import Link from 'next/link';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    name: validator.pipe(validator.string('Nama kategori barang harus berupa huruf'), validator.nonEmpty('Nama kategori barang harus diisi'), validator.minLength(2, 'Nama kategori barang minimal 2 huruf'))
});

const CategoryList = () => {
    const [list, setList] = useState<CategoryDocument[]>([]);
    const [record, setRecord] = useState<CategoryDocument | null | undefined>();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const toast = useRef<Toast | null>(null);

    const doSubmit = async (record: any, _id?: string) => {
        let saved = false;
        let notices: string[] = [];
        const validated = validator.safeParse(payloadSchema, record, { abortPipeEarly: true });

        if (validated.success) {
            try {
                const response = await fetch(`/api/category${_id ? `/${_id}` : ''}`, {
                    method: !_id ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });
                const result = await response.json();
                saved = result?.saved || false;
            } catch (_) {
                console.error(_);
            }
        } else {
            notices = validated.issues.map(({ message }) => message);
        }

        if (saved) {
            await fetching();
        }

        return { saved, notices };
    };

    const viewer = (selected: CategoryDocument | null = null) => {
        setRecord(selected);
        setVisible(true);
    };

    const fetching = useCallback(async () => {
        try {
            const response = await fetch('/api/category', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
            setList(await response.json());
        } catch (_) {
            console.error(_);
        }

        setLoading(false);
        initFilters();
    }, []);

    const nameBodyTemplate = (rowData: CategoryDocument) => (
        <Link href="#" onClick={() => viewer(rowData)}>
            {rowData.name}
        </Link>
    );
    const editBodyTemplate = (rowData: CategoryDocument) => <Button icon="pi pi-pencil" outlined onClick={() => viewer(rowData)} />;

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
                <Button type="button" icon="pi pi-tag" label="Tambah" outlined onClick={() => viewer()} />
                <span className="p-input-icon-left filter-input–table">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
                </span>
            </div>
        );
    };

    useEffect(() => {
        setLoading(true);
        fetching();
    }, [fetching]);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Tabel Kategori Barang</h5>
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
                        <Column header="" body={editBodyTemplate} className="filter-action-button" />
                    </DataTable>
                    <Toast ref={toast} />
                    <Sidebar visible={visible} onHide={() => setVisible(false)} baseZIndex={1000} position="right">
                        <div className="grid">
                            <div className="col-12">
                                <CategoryForm record={record} toast={toast.current} doSubmit={doSubmit} mode={!record?._id ? 'add' : 'edit'} setVisible={setVisible} />
                            </div>
                        </div>
                    </Sidebar>
                </div>
            </div>
        </div>
    );
};

export default CategoryList;
