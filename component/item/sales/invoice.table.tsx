import { formatRp } from '@/lib/client.action';
import { SalesDocument } from '@/models/sales.schema';
import { TableInventoryProps } from '@/types/layout';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InventoryHeader } from '../inventory.header';

dayjs.locale('id');

export const TableBySales = ({ list, loading, filters, globalFilterValue, onGlobalFilterChange, dateFilter, setDateFilter }: TableInventoryProps) => {
    const router = useRouter();

    const referenceBodyTemplate = (rowData: SalesDocument) => (
        <Link href={`/sales/${rowData._id}`} style={{ display: 'flex', alignItems: 'center' }}>
            {rowData.reference}
        </Link>
    );
    const editBodyTemplate = (rowData: SalesDocument) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/sales/${rowData._id}`)} />;
    const dateBodyTemplate = ({ date }: any) => dayjs(date).format('DD MMMM YYYY');
    const costBodyTemplate = (rowData: any) => formatRp(rowData.cost);
    const taxBodyTemplate = ({ tax }: any) => `${tax ? tax + ' %' : ''}`;

    return (
        <DataTable
            className="p-datatable-gridlines"
            header={<InventoryHeader addUrl="/sales/baru" globalFilterValue={globalFilterValue} onGlobalFilterChange={onGlobalFilterChange} dateFilter={dateFilter} setDateFilter={setDateFilter} />}
            loading={loading}
            filters={filters}
            value={list}
            rows={10}
            stateStorage="local"
            stateKey="sales-invoice-table"
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
            <Column header="Pelanggan" field="customer.name" />
            <Column header="PPN" filterField="tax" body={taxBodyTemplate} />
            <Column header="Total Biaya" filterField="cost" body={costBodyTemplate} />
            <Column header="" body={editBodyTemplate} className="filter-action-button" />
        </DataTable>
    );
};
