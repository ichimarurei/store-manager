import { ProductDocument } from '@/models/product.schema';
import { ReceiptDocument } from '@/models/receipt.schema';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { useEffect, useState } from 'react';
import ItemPickOverlay from './item.pick.overlay';

dayjs.locale('id');

const createLogEntry = (activity: any, action: string): any => ({ name: activity?.by?.name, time: dayjs(activity?.time).format('DD MMM YYYY HH:mm:ss'), action });

const createLogs = (author: any | null): any[] => {
    if (author) {
        const createdLog = createLogEntry(author.created, 'Dibuat');
        const editedLog = author.edited ? createLogEntry(author.edited, 'Diubah') : null;

        return [createdLog, ...(editedLog ? [editedLog] : [])];
    } else {
        return [];
    }
};

const ItemForm = ({ mode, record, list, addToCart, getProducts }: { mode: 'add' | 'edit'; record: ReceiptDocument | undefined | null; list: ProductDocument[]; addToCart: (value: any) => void; getProducts: () => Promise<void> }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const setLogInfo = (author?: any | null) => setLogs(createLogs(author));

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

    useEffect(() => {
        setLogInfo(record?.author ?? null);
    }, [record]);

    return (
        <div className="card">
            <div className="flex align-items-center justify-content-between">
                <h5>Tabel Barang</h5>
                {mode === 'edit' && <Button aria-label="Riwayat Pendataan" icon="pi pi-history" rounded text severity="help" onClick={() => setVisible(true)} tooltip="Riwayat Pendataan" tooltipOptions={{ position: 'left' }} />}
            </div>
            <p>Pemilihan daftar barang masuk {mode === 'edit' && <mark>{record?.reference}</mark>}</p>
            <Sidebar visible={visible} position="right" className="w-full md:w-25rem" onHide={() => setVisible(false)}>
                <h2>Riwayat Pendataan</h2>
                <DataTable value={logs} size="small" showGridlines stripedRows>
                    <Column field="action" header="Status" />
                    <Column field="name" header="Operator" />
                    <Column field="time" header="Waktu" />
                </DataTable>
            </Sidebar>
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
