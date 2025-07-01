import { formatRp, initUnits, pickUnitDetail, processRangePrice } from '@/lib/client.action';
import { DropdownItem } from '@/types/app';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Fieldset } from 'primereact/fieldset';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { SplitButton } from 'primereact/splitbutton';
import { useState } from 'react';

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

const countCost = (qty: number, cost: number, bundle: number) => {
    let pay = 0;

    if (qty > 0 && cost > 0) {
        pay = cost / (bundle > 0 ? qty * bundle : qty);
    }

    return pay;
};

const ItemEditor = ({ product, selected, setSelected }: { product: any; selected: any[]; setSelected: (value: any[]) => void }) => {
    const [unit, setUnit] = useState<DropdownItem | undefined>();
    const [unitBonus, setUnitBonus] = useState<DropdownItem | undefined>();
    const [qty, setQty] = useState(0);
    const [qtyBonus, setQtyBonus] = useState(0);
    const [cost, setCost] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [pay, setPay] = useState(0);
    const [minus, setMinus] = useState(0);
    const [wrapValue, setWrapValue] = useState(1);
    const [picked, setPicked] = useState('');
    const [units, setUnits] = useState<DropdownItem[]>([]);
    const [visible, setVisible] = useState(false);
    const [warning, setWarning] = useState(false);

    const handleClick = (e: React.SyntheticEvent) => {
        let bundle = 0;

        if (product.item?.bundle?.node?.unit?._id === product.sales?.unit) {
            bundle = product.item?.bundle?.contain?.amount ?? 0;
        }

        setUnits(initUnits(product?.item));
        setQty(product?.sales?.qty ?? 0);
        setQtyBonus(product?.bonus?.qty ?? 0);
        setDiscount(product?.discount ?? 0);
        setPay(product?.cost ?? 0);
        setCost(countCost(product?.sales?.qty ?? 0, product?.cost ?? 0, bundle));
        setUnit({ code: pickUnitDetail(product.item, product.sales?.unit)?._id, name: pickUnitDetail(product.item, product.sales?.unit)?.name });
        setUnitBonus({ code: pickUnitDetail(product.item, product.bonus?.unit)?._id, name: pickUnitDetail(product.item, product.bonus?.unit)?.name });
        setPicked(product?.key ?? '');
        setVisible(true);
        setWarning(false);
        setMinus(0);
        setWrapValue(bundle || 1);
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
            <Dialog
                modal
                visible={visible}
                header={`Ubah: ${product.item?.name}`}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
                footer={
                    <div>
                        <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={() => setVisible(false)} autoFocus />
                        <Button
                            label="Ubah"
                            disabled={!qty || !unit || !cost}
                            onClick={() => {
                                setVisible(false);
                                setSelected(
                                    selected.map((item) => {
                                        if (item.key === picked) {
                                            return { ...item, discount, cost: pay, sales: { qty, unit: unit?.code }, bonus: { qty: qtyBonus, unit: unitBonus?.code } };
                                        }

                                        return item;
                                    })
                                );
                            }}
                        />
                    </div>
                }
            >
                <div className="card">
                    {warning && (
                        <div className="flex flex-column flex-wrap align-items-start justify-content-start gap-3 mb-5">
                            {!product.item?.cost?.length && <Message severity="warn" className="justify-content-start" text="Produk belum memiliki rentang harga modal!" />}
                            {!product.item?.inventory && <Message severity="warn" className="justify-content-start" text="Produk belum memiliki stok!" />}
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
                                    value={product.item?.inventory ? `${Intl.NumberFormat('id-ID', { style: 'decimal' }).format(product.item?.inventory ?? 0)} ${product.item?.unit?.name ?? ''}` : ''}
                                    className={product.item?.inventory ? '' : 'p-invalid'}
                                    {...(!product.item?.inventory && { style: { borderColor: '#cc8925' } })}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="price-range">Modal</label>
                                <InputText
                                    readOnly
                                    id="price-range"
                                    placeholder="Rentang modal"
                                    value={processRangePrice(((product.item?.cost as number[]) ?? []).map((value) => value * wrapValue))}
                                    className={product.item?.cost?.length ? '' : 'p-invalid'}
                                    {...(!product.item?.cost?.length && { style: { borderColor: '#cc8925' } })}
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

                                    if (product.item?.bundle?.node?.unit?._id === unit?.code) {
                                        bundle = product.item?.bundle?.contain?.amount ?? 0;
                                    }

                                    const { pay, cart } = countPay(val, cost ?? 0, bundle);
                                    const isOutStock = cart + (qtyBonus ?? 0) > (product.item?.inventory ?? 0);
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

                                    if (product.item?.bundle?.node?.unit?._id === value?.code) {
                                        bundle = product.item?.bundle?.contain?.amount ?? 0;
                                    }

                                    const { pay, cart } = countPay(qty ?? 0, cost ?? 0, bundle);
                                    const isOutStock = cart + (qtyBonus ?? 0) > (product.item?.inventory ?? 0);
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

                                    if (product.item?.bundle?.node?.unit?._id === unit?.code) {
                                        bundle = product.item?.bundle?.contain?.amount ?? 0;
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

                                        if (product.item?.bundle?.node?.unit?._id === unit?.code) {
                                            bundle = product.item?.bundle?.contain?.amount ?? 0;
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
                    <Fieldset legend="Bonus" style={{ marginTop: '1.5rem' }} collapsed={!qtyBonus} toggleable>
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

                                        if (product.item?.bundle?.node?.unit?._id === unit?.code) {
                                            bundle = product.item?.bundle?.contain?.amount ?? 0;
                                        }

                                        if (product.item?.bundle?.node?.unit?._id === unitBonus?.code) {
                                            bundleBonus = product.item?.bundle?.contain?.amount ?? 1;
                                        }

                                        const { cart } = countPay(qty ?? 0, cost ?? 0, bundle);
                                        const isOutStock = cart + val * bundleBonus > (product.item?.inventory ?? 0);
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

                                        if (product.item?.bundle?.node?.unit?._id === unit?.code) {
                                            bundle = product.item?.bundle?.contain?.amount ?? 0;
                                        }

                                        if (product.item?.bundle?.node?.unit?._id === value?.code) {
                                            bundleBonus = product.item?.bundle?.contain?.amount ?? 1;
                                        }

                                        const { cart } = countPay(qty ?? 0, cost ?? 0, bundle);
                                        const isOutStock = cart + (qtyBonus ?? 0) * bundleBonus > (product.item?.inventory ?? 0);
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
        </>
    );
};

export default ItemEditor;
