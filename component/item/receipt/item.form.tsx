import { ProductDocument } from '@/models/product.schema';
import { ReceiptDocument } from '@/models/receipt.schema';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import ItemPickOverlay from './item.pick.overlay';

const ItemForm = ({ mode, record, list, addToCart, getProducts }: { mode: 'add' | 'edit'; record: ReceiptDocument | undefined | null; list: ProductDocument[]; addToCart: (value: any) => void; getProducts: () => Promise<void> }) => {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');

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

    const doFetch = async () => {
        setLoading(true);
        await getProducts();
        setLoading(false);
        initFilters();
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between flex-wrap">
                <Button type="button" icon="pi pi-sync" label="Sinkron" outlined onClick={async () => await doFetch()} />
                <span className="p-input-icon-left filter-input–table">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
                </span>
            </div>
        );
    };

    const nameBodyTemplate = (rowData: ProductDocument) => <ItemPickOverlay mode="link" item={rowData} addToCart={addToCart} />;
    const pickBodyTemplate = (rowData: ProductDocument) => <ItemPickOverlay mode="button" item={rowData} addToCart={addToCart} />;

    useEffect(() => {
        const fetching = async () => await doFetch();

        fetching();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="card">
            <h5>Tabel Barang</h5>
            <p>Pemilihan daftar barang masuk {mode === 'edit' && <mark>{record?.reference}</mark>}</p>
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
                <Column header="" body={pickBodyTemplate} className="filter-action-button" />
            </DataTable>
        </div>
    );
};

export default ItemForm;
