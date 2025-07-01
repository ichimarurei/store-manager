import { formatRp, getDefaultProduct, initUnits, processRangePrice } from '@/lib/client.action';
import { ProductDocument } from '@/models/product.schema';
import { DropdownItem } from '@/types/app';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Fieldset } from 'primereact/fieldset';
import { Image } from 'primereact/image';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { useState } from 'react';

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

const countPay = (qty: number, cost: number, bundle: number) => {
    let pay = 0;
    let cart = 0;

    if (qty > 0) {
        cart = bundle > 0 ? qty * bundle : qty;

        if (cost > 0) {
            pay = bundle > 0 ? qty * bundle * cost : qty * cost;
        }
    }

    return { pay, cart };
};

const ItemPickOverlay = ({ item, mode, addToCart }: { item?: ProductDocument; mode: 'button' | 'link'; addToCart: (value: any) => void }) => {
    const [unit, setUnit] = useState<DropdownItem | undefined>();
    const [unitBonus, setUnitBonus] = useState<DropdownItem | undefined>();
    const [qty, setQty] = useState(0);
    const [qtyBonus, setQtyBonus] = useState(0);
    const [cost, setCost] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [pay, setPay] = useState(0);
    const [minus, setMinus] = useState(0);
    const [wrapValue, setWrapValue] = useState(1);
    const [units, setUnits] = useState<DropdownItem[]>([]);
    const [visible, setVisible] = useState(false);
    const [warning, setWarning] = useState(false);

    const onClicking = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setWarning(!item?.cost?.length || !item?.inventory);
        setMinus(0);
        setCost(0);
        setQty(0);
        setQtyBonus(0);
        setDiscount(0);
        setPay(0);
        setWrapValue(1);
        setUnit(undefined);
        setUnitBonus(undefined);

        if (item) {
            const opts = initUnits(item);
            setUnits(opts);
            setUnit(opts[0]);
        }

        setVisible(true);
    };

    return (
        <div>
            <Navigator mode={mode} item={item} onClicking={onClicking} />
            <Dialog
                modal
                visible={visible}
                header={`Tambahkan: ${item?.name}`}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
                footer={
                    <div>
                        <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={() => setVisible(false)} autoFocus />
                        <Button
                            label="Tambah"
                            disabled={!qty || !unit || !cost}
                            onClick={() => {
                                setVisible(false);
                                addToCart({ item, discount, cost: pay, sales: { qty, unit: unit?.code }, bonus: { qty: qtyBonus, unit: unitBonus?.code } });
                            }}
                        />
                    </div>
                }
            >
                <div className="card">
                    {warning && (
                        <div className="flex flex-column flex-wrap align-items-start justify-content-start gap-3 mb-5">
                            {!item?.cost?.length && <Message severity="warn" className="justify-content-start" text="Produk belum memiliki rentang harga modal!" />}
                            {!item?.inventory && <Message severity="warn" className="justify-content-start" text="Produk belum memiliki stok!" />}
                            {minus > 0 && <Message severity="warn" className="justify-content-start" text={`Total barang (${minus} ${units[0].name}) keluar melebihi stok!`} />}
                        </div>
                    )}
                    <Fieldset legend="Info" style={{ marginBottom: '1.5rem' }} toggleable>
                        <div className="p-fluid formgrid grid gap-field-parent">
                            <div className="field col-12 md:col-3">
                                <label htmlFor="price-range">Stok</label>
                                <InputText
                                    readOnly
                                    id="price-range"
                                    placeholder="Stok tersedia"
                                    value={item?.inventory ? `${Intl.NumberFormat('id-ID', { style: 'decimal' }).format(item?.inventory ?? 0)} ${(item?.unit as any)?.name ?? ''}` : ''}
                                    className={item?.inventory ? '' : 'p-invalid'}
                                    {...(!item?.inventory && { style: { borderColor: '#cc8925' } })}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="price-range">Modal</label>
                                <InputText
                                    readOnly
                                    id="price-range"
                                    placeholder="Rentang modal"
                                    value={processRangePrice((item?.cost ?? []).map((value) => value * wrapValue))}
                                    className={item?.cost?.length ? '' : 'p-invalid'}
                                    {...(!item?.cost?.length && { style: { borderColor: '#cc8925' } })}
                                />
                            </div>
                            <div className="field col-12 md:col-5">
                                <p className="text-5xl text-right">{formatRp(pay)}</p>
                            </div>
                        </div>
                    </Fieldset>
                    <div className="p-fluid formgrid grid gap-field-parent">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="bundleAmount">
                                Qty <sup className="text-red-500">*</sup>
                            </label>
                            <InputNumber
                                id="bundleAmount"
                                placeholder="Qty barang keluar"
                                value={qty}
                                min={0}
                                maxFractionDigits={0}
                                onChange={({ value }) => {
                                    const val = value ?? 0;
                                    let bundle = 0;

                                    if (item?.bundle?.node?.unit?._id === unit?.code) {
                                        bundle = item?.bundle?.contain?.amount ?? 0;
                                    }

                                    const { pay, cart } = countPay(val, cost ?? 0, bundle);
                                    const isOutStock = cart + (qtyBonus ?? 0) > (item?.inventory ?? 0);
                                    setQty(val);
                                    setPay(pay);
                                    setWarning(isOutStock);
                                    setMinus(cart + (qtyBonus ?? 0));
                                }}
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="bundleUnit">
                                Satuan <sup className="text-red-500">*</sup>
                            </label>
                            <Dropdown
                                id="bundleUnit"
                                optionLabel="name"
                                placeholder="Satuan barang keluar"
                                value={unit}
                                options={units}
                                onChange={({ value }) => {
                                    let bundle = 0;

                                    if (item?.bundle?.node?.unit?._id === value?.code) {
                                        bundle = item?.bundle?.contain?.amount ?? 0;
                                    }

                                    const { pay, cart } = countPay(qty ?? 0, cost ?? 0, bundle);
                                    const isOutStock = cart + (qtyBonus ?? 0) > (item?.inventory ?? 0);
                                    setUnit(value);
                                    setPay(pay);
                                    setWrapValue(bundle || 1);
                                    setWarning(isOutStock);
                                    setMinus(cart + (qtyBonus ?? 0));
                                }}
                            />
                            <small>Satuan terkecil atau bundel dari produk</small>
                        </div>
                        <div className="field col-12 md:col-8">
                            <label htmlFor="cost">
                                Harga <sup className="text-red-500">*</sup>
                            </label>
                            <InputNumber
                                id="cost"
                                placeholder="Harga jual produk"
                                value={cost}
                                min={0}
                                maxFractionDigits={0}
                                mode="currency"
                                currency="IDR"
                                onChange={({ value }) => {
                                    const val = value ?? 0;
                                    let bundle = 0;

                                    if (item?.bundle?.node?.unit?._id === unit?.code) {
                                        bundle = item?.bundle?.contain?.amount ?? 0;
                                    }

                                    const { pay } = countPay(qty ?? 0, val, bundle);
                                    setCost(val);
                                    setPay(pay);
                                }}
                            />
                            <small>Dalam rupiah (IDR)</small>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="discount">Diskon</label>
                            <div className="p-inputgroup flex-1">
                                <InputNumber
                                    id="discount"
                                    placeholder="Diskon dari supplier"
                                    value={discount}
                                    min={0}
                                    maxFractionDigits={2}
                                    onChange={({ value }) => {
                                        const val = value ?? 0;
                                        let bundle = 0;

                                        if (item?.bundle?.node?.unit?._id === unit?.code) {
                                            bundle = item?.bundle?.contain?.amount ?? 0;
                                        }

                                        const { pay } = countPay(qty ?? 0, cost ?? 0, bundle);
                                        setDiscount(val);
                                        setPay(pay);
                                    }}
                                />
                                <span className="p-inputgroup-addon">%</span>
                            </div>
                        </div>
                    </div>
                    <Fieldset legend="Bonus" style={{ marginTop: '1.5rem' }} toggleable collapsed>
                        <div className="p-fluid formgrid grid gap-field-parent">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="bonusAmount">Qty</label>
                                <InputNumber
                                    id="bonusAmount"
                                    placeholder="Qty barang bonus"
                                    value={qtyBonus}
                                    min={0}
                                    maxFractionDigits={0}
                                    onChange={({ value }) => {
                                        const val = value ?? 0;
                                        let bundle = 0;
                                        let bundleBonus = 1;

                                        if (item?.bundle?.node?.unit?._id === unit?.code) {
                                            bundle = item?.bundle?.contain?.amount ?? 0;
                                        }

                                        if (item?.bundle?.node?.unit?._id === unitBonus?.code) {
                                            bundleBonus = item?.bundle?.contain?.amount ?? 1;
                                        }

                                        const { cart } = countPay(qty ?? 0, cost ?? 0, bundle);
                                        const isOutStock = cart + val * bundleBonus > (item?.inventory ?? 0);
                                        setQtyBonus(val);
                                        setWarning(isOutStock);
                                        setMinus(cart + val * bundleBonus);
                                    }}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="bonusUnit">Satuan</label>
                                <Dropdown
                                    id="bonusUnit"
                                    optionLabel="name"
                                    placeholder="Satuan barang bonus"
                                    value={unitBonus}
                                    options={units}
                                    onChange={({ value }) => {
                                        let bundle = 0;
                                        let bundleBonus = 1;

                                        if (item?.bundle?.node?.unit?._id === unit?.code) {
                                            bundle = item?.bundle?.contain?.amount ?? 0;
                                        }

                                        if (item?.bundle?.node?.unit?._id === value?.code) {
                                            bundleBonus = item?.bundle?.contain?.amount ?? 1;
                                        }

                                        const { cart } = countPay(qty ?? 0, cost ?? 0, bundle);
                                        const isOutStock = cart + (qtyBonus ?? 0) * bundleBonus > (item?.inventory ?? 0);
                                        setUnitBonus(value);
                                        setWarning(isOutStock);
                                        setMinus(cart + (qtyBonus ?? 0) * bundleBonus);
                                    }}
                                />
                                <small>Satuan terkecil atau bundel dari produk</small>
                            </div>
                        </div>
                    </Fieldset>
                </div>
            </Dialog>
        </div>
    );
};

export default ItemPickOverlay;
