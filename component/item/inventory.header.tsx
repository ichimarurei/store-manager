import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';

export const InventoryHeader = ({
    addUrl,
    globalFilterValue,
    dateFilter,
    onGlobalFilterChange,
    setDateFilter
}: {
    addUrl: string;
    globalFilterValue: string;
    onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dateFilter: (Date | null)[] | null;
    setDateFilter: (value: (Date | null)[] | null) => void;
}) => {
    const router = useRouter();

    return (
        <div className="flex justify-content-between flex-wrap gap-3">
            <Button type="button" icon="pi pi-box" label="Tambah" outlined onClick={() => router.push(addUrl)} />
            <div className="flex justify-around gap-3 flex-wrap">
                <span className="p-input-icon-left filter-input–table">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
                </span>
                <Calendar showIcon showButtonBar readOnlyInput hideOnDateTimeSelect placeholder="Filter tanggal" dateFormat="dd/mm/yy" selectionMode="range" value={dateFilter} onChange={({ value }) => setDateFilter(value ?? null)} />
            </div>
        </div>
    );
};
