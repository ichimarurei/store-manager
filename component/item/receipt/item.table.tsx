import { formatRp, getDefaultProduct } from '@/lib/client.action';
import { TableInventoryProps } from '@/types/layout';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Image } from 'primereact/image';
import { RenderHeader } from './header';

export const TableByItem = ({ list, loading, filters, globalFilterValue, onGlobalFilterChange }: TableInventoryProps) => {
    const router = useRouter();

    const nameBodyTemplate = ({ product, parent }: any) => (
        <Link href={`/receipt/item/${parent}/${product._id}`} style={{ display: 'flex', alignItems: 'center' }}>
            <Image alt="product image" src={product?.images?.at(0) || getDefaultProduct()} width="32" height="32" style={{ verticalAlign: 'middle' }} imageStyle={{ borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ marginLeft: '.5em', verticalAlign: 'middle' }}>{product.name}</span>
        </Link>
    );
    const editBodyTemplate = ({ product, parent }: any) => <Button icon="pi pi-pencil" outlined onClick={() => router.push(`/receipt/item/${parent}/${product._id}`)} />;
    const qtyBodyTemplate = ({ qty, unit }: any) => `${Intl.NumberFormat('id-ID', { style: 'decimal' }).format(qty)} ${unit?.name || ''}`;
    const discountBodyTemplate = ({ discount }: any) => `${discount ? `${discount} %` : ''}`;
    const costBodyTemplate = ({ cost }: any) => formatRp(cost);
    const dateBodyTemplate = ({ date }: any) => dayjs(date).format('DD MMMM YYYY');

    return (
        <DataTable
            className="p-datatable-gridlines"
            header={() => <RenderHeader modePreview="faktur" globalFilterValue={globalFilterValue} onGlobalFilterChange={onGlobalFilterChange} />}
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
            <Column header="Produk" filterField="product.name" body={nameBodyTemplate} />
            <Column header="Kategori" field="product.category.name" />
            <Column header="Modal" filterField="cost" body={costBodyTemplate} />
            <Column header="Diskon" filterField="discount" body={discountBodyTemplate} />
            <Column header="Qty" filterField="qty" body={qtyBodyTemplate} />
            <Column header="" body={editBodyTemplate} className="filter-action-button" />
        </DataTable>
    );
};
