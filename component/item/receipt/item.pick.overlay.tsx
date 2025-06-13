import { getDefaultProduct } from '@/lib/client.action';
import { ProductDocument } from '@/models/product.schema';
import { DropdownItem } from '@/types/app';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Image } from 'primereact/image';
import { InputNumber } from 'primereact/inputnumber';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';

const Navigator = ({ mode, item, onClicking }: { mode: 'button' | 'link'; item?: ProductDocument; onClicking: (e: React.SyntheticEvent) => void }) => {
    return mode === 'button' ? (
        <Button icon="pi pi-plus" outlined onClick={onClicking} />
    ) : (
        mode === 'link' && (
            <Link href="#" style={{ display: 'flex', alignItems: 'center' }} onClick={onClicking}>
                <Image alt="product image" src={item?.images?.at(0) ?? getDefaultProduct()} width="32" height="32" style={{ verticalAlign: 'middle' }} imageStyle={{ borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ marginLeft: '.5em', verticalAlign: 'middle' }}>{item?.name}</span>
            </Link>
        )
    );
};

const ItemPickOverlay = ({ item, mode, addToCart }: { item?: ProductDocument; mode: 'button' | 'link'; addToCart: (value: any) => void }) => {
    const [unit, setUnit] = useState<DropdownItem | undefined>();
    const [qty, setQty] = useState(0);
    const [cost, setCost] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [units, setUnits] = useState<DropdownItem[]>([]);
    const overlayPanel = useRef<OverlayPanel | null>(null);

    const onClicking = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setUnit(undefined);
        setQty(0);
        setCost(0);
        setDiscount(0);
        overlayPanel.current?.toggle(e);
    };

    useEffect(() => {
        const initUnits = () => {
            const options = [{ code: (item?.unit as any)?._id, name: (item?.unit as any)?.name }];

            if (item?.bundle) {
                options.push({ code: (item.bundle.node?.unit as any)?._id, name: (item.bundle.node?.unit as any)?.name });
            }

            setUnits(options);
        };

        initUnits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Navigator mode={mode} item={item} onClicking={onClicking} />
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
                    label="Tambah"
                    disabled={!qty || !unit || !cost}
                    onClick={() => {
                        overlayPanel.current?.hide();
                        addToCart({ item, qty, cost, discount, unit: unit?.code });
                    }}
                />
            </OverlayPanel>
        </div>
    );
};

export default ItemPickOverlay;
