import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

export const RenderHeader = ({ modePreview, globalFilterValue, onGlobalFilterChange }: { modePreview: string; globalFilterValue: string; onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const router = useRouter();

    return (
        <div className="flex justify-content-between flex-wrap">
            <Button type="button" icon="pi pi-box" label="Tambah" outlined onClick={() => router.push(`/receipt/${modePreview === 'produk' ? 'item' : 'invoice'}/baru`)} />
            <span className="p-input-icon-left filter-input–table">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pencarian" />
            </span>
        </div>
    );
};
