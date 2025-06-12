import { formatRp } from '@/lib/client.action';
import { ReceiptDocument } from '@/models/receipt.schema';
import { TableInventoryProps } from '@/types/layout';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { RenderHeader } from './header';

dayjs.locale('id');

export const TableByReceipt = ({ list, loading, filters, globalFilterValue, onGlobalFilterChange, dateFilter, setDateFilter }: TableInventoryProps) => {
    const router = useRouter();

    const referenceBodyTemplate = (rowData: ReceiptDocument) => (
        <Link href={`/receipt/${rowData._id}`} style={{ display: 'flex', alignItems: 'center' }}>
            {rowData.reference}
        </Link>
    );
    const editBodyTemplate = (rowData: ReceiptDocument) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/receipt/${rowData._id}`)} />;
    const dateBodyTemplate = ({ date }: any) => dayjs(date).format('DD MMMM YYYY');
    const costBodyTemplate = (rowData: any) => formatRp(rowData.cost);

    return (
        <DataTable
            className="p-datatable-gridlines"
            header={() => <RenderHeader modePreview="faktur" globalFilterValue={globalFilterValue} onGlobalFilterChange={onGlobalFilterChange} dateFilter={dateFilter} setDateFilter={setDateFilter} />}
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
            <Column header="Tanggal" filterField="date" body={dateBodyTemplate} />
            <Column header="No Faktur" filterField="reference" body={referenceBodyTemplate} />
            <Column header="Supplier" field="supplier.name" />
            <Column header="Total Biaya" filterField="cost" body={costBodyTemplate} />
            <Column header="" body={editBodyTemplate} className="filter-action-button" />
        </DataTable>
    );
};
