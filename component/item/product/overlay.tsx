import { IBundling } from '@/models/bundling';
import { DropdownItem } from '@/types/app';
import { Types } from 'mongoose';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { OverlayPanel } from 'primereact/overlaypanel';
import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

const FormOverlay = ({ units, unit, bundle, setBundle }: { units: DropdownItem[]; unit?: Types.ObjectId; bundle?: IBundling; setBundle: (value: SetStateAction<IBundling | undefined | null>) => void }) => {
    const [bundlePlaceholder, setBundlePlaceholder] = useState('');
    const overlayPanel = useRef<OverlayPanel | null>(null);

    const getUnitDetail = useCallback((id: Types.ObjectId) => units.find(({ code }) => code === id) || units[0] || null, [units]);

    useEffect(() => setBundlePlaceholder(`Qty bundel untuk 1 ${getUnitDetail(bundle?.node?.unit || units[0]?.code)?.name} = ${bundle?.contain?.amount || 'X'} ${getUnitDetail(unit || units[0]?.code)?.name}`), [bundle, getUnitDetail, unit, units]);

    return (
        <div className="field col-12 md:col-2 gap-field">
            <label htmlFor="bundle">Bundel</label>
            <Button id="bundle" type="button" severity="secondary" icon="pi pi-bookmark" label="Bundel" onClick={(e) => overlayPanel.current?.toggle(e)} />
            <OverlayPanel ref={overlayPanel} showCloseIcon>
                <div className="p-fluid formgrid grid gap-field-parent">
                    <div className="field col-12 gap-field">
                        <label htmlFor="bundleUnit">Satuan</label>
                        <Dropdown
                            id="bundleUnit"
                            optionLabel="name"
                            placeholder="Satuan Bundel"
                            value={getUnitDetail(bundle?.node?.unit || units[0]?.code)}
                            options={units}
                            onChange={(e) => setBundle({ ...bundle, node: { amount: 1, unit: e.value?.code } })}
                        />
                    </div>
                    <div className="field col-12 gap-field">
                        <label htmlFor="bundleAmount">Qty</label>
                        <InputNumber
                            id="bundleAmount"
                            placeholder={bundlePlaceholder}
                            value={bundle?.contain?.amount || 0}
                            min={0}
                            maxFractionDigits={0}
                            onValueChange={({ value }) => setBundle({ ...bundle, contain: { amount: value || 0, unit: unit || units[0]?.code } })}
                            onChange={({ value }) => setBundlePlaceholder(`Qty bundel untuk 1 ${getUnitDetail(bundle?.node?.unit || units[0]?.code)?.name} = ${value || 0} ${getUnitDetail(unit || units[0]?.code)?.name}`)}
                        />
                        <small>{bundlePlaceholder}</small>
                    </div>
                </div>
            </OverlayPanel>
        </div>
    );
};

export default FormOverlay;
