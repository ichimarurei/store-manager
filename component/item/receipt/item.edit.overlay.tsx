import { initUnits, pickUnitDetail } from '@/lib/client.action';
import { DropdownItem } from '@/types/app';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { OverlayPanel } from 'primereact/overlaypanel';
import { SplitButton } from 'primereact/splitbutton';
import { useRef, useState } from 'react';

const ItemEditor = ({ product, selected, setSelected }: { product: any; selected: any[]; setSelected: (value: any[]) => void }) => {
    const [unit, setUnit] = useState<DropdownItem | undefined>();
    const [qty, setQty] = useState(0);
    const [cost, setCost] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [picked, setPicked] = useState('');
    const [units, setUnits] = useState<DropdownItem[]>([]);
    const overlayPanel = useRef<OverlayPanel | null>(null);

    const handleClick = (e: React.SyntheticEvent) => {
        setUnits(initUnits(product?.item));
        setQty(product?.qty ?? 0);
        setCost(product?.cost ?? 0);
        setDiscount(product?.discount ?? 0);
        setUnit({ code: pickUnitDetail(product.item, product.unit)?._id, name: pickUnitDetail(product.item, product.unit)?.name });
        setPicked(product?.key ?? '');
        overlayPanel.current?.toggle(e);
    };

    return (
        <>
            <SplitButton
                outlined
                icon="pi pi-pencil"
                severity="warning"
                size="small"
                label="Ubah"
                onClick={handleClick}
                model={[
                    {
                        label: 'Hapus',
                        icon: 'pi pi-times',
                        command: () => setSelected(selected.filter(({ key }) => key !== product.key))
                    }
                ]}
            />
            <OverlayPanel ref={overlayPanel} showCloseIcon>
                <div className="p-fluid formgrid grid gap-field-parent">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="bundleAmount">
                            Qty <sup className="text-red-500">*</sup>
                        </label>
                        <InputNumber id="bundleAmount" placeholder="Qty barang masuk" value={qty} min={0} maxFractionDigits={0} onChange={({ value }) => setQty(value ?? 0)} />
                    </div>
                    <div className="field col-12 md:col-8">
                        <label htmlFor="bundleUnit">
                            Satuan <sup className="text-red-500">*</sup>
                        </label>
                        <Dropdown id="bundleUnit" optionLabel="name" placeholder="Satuan barang masuk" value={unit ?? units[0]?.code} options={units} onChange={({ value }) => setUnit(value)} />
                        <small>Satuan terkecil atau bundel dari produk</small>
                    </div>
                </div>
                <div className="p-fluid formgrid grid gap-field-parent">
                    <div className="field col-12 md:col-8">
                        <label htmlFor="cost">
                            Biaya <sup className="text-red-500">*</sup>
                        </label>
                        <InputNumber id="cost" placeholder="Modal produk" value={cost} onChange={(e) => setCost(e.value ?? 0)} min={0} maxFractionDigits={0} mode="currency" currency="IDR" />
                        <small>Dalam rupiah (IDR)</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="discount">Diskon</label>
                        <div className="p-inputgroup flex-1">
                            <InputNumber id="discount" placeholder="Diskon dari supplier" value={discount} onValueChange={(e) => setDiscount(e.value ?? 0)} min={0} maxFractionDigits={2} />
                            <span className="p-inputgroup-addon">%</span>
                        </div>
                    </div>
                </div>
                <Button
                    label="Ubah"
                    disabled={!qty || !unit || !cost}
                    onClick={() => {
                        setSelected(
                            selected.map((item) => {
                                if (item.key === picked) {
                                    return { ...item, qty, cost, discount, unit: unit?.code };
                                }

                                return item;
                            })
                        );
                        overlayPanel.current?.hide();
                    }}
                />
            </OverlayPanel>
        </>
    );
};

export default ItemEditor;
