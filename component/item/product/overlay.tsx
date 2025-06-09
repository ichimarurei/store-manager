import { IBundling } from '@/models/bundling';
import { DropdownItem } from '@/types/app';
import { Types } from 'mongoose';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber, InputNumberChangeEvent, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { OverlayPanel } from 'primereact/overlaypanel';
import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

const FormOverlay = ({ units, unit, bundle, setBundle }: { units: DropdownItem[]; unit?: Types.ObjectId; bundle?: IBundling; setBundle: (value: SetStateAction<IBundling | undefined | null>) => void }) => {
    const [bundlePlaceholder, setBundlePlaceholder] = useState('');
    const overlayPanel = useRef<OverlayPanel | null>(null);

    const getUnitDetail = useCallback((id: Types.ObjectId) => units.find(({ code }) => code === id) || units[0] || null, [units]);

    const placeholderProvider = useCallback(
        (amount?: number | string | null) => `Qty bundel untuk 1 ${getUnitDetail(bundle?.node?.unit || units[0]?.code)?.name} = ${amount || 0} ${getUnitDetail(unit || units[0]?.code)?.name}`,
        [bundle?.node?.unit, getUnitDetail, unit, units]
    );

    const generateBundlePlaceholder = useCallback((bundle?: IBundling) => placeholderProvider(bundle?.contain?.amount), [placeholderProvider]);

    const handleUnitChange = ({ value }: DropdownChangeEvent) => setBundle({ ...bundle, node: { amount: 1, unit: value?.code } });

    const handleAmountChange = ({ value }: InputNumberValueChangeEvent) => setBundle({ ...bundle, contain: { amount: value || 0, unit: unit || units[0]?.code } });

    const handleInputChange = ({ value }: InputNumberChangeEvent) => setBundlePlaceholder(placeholderProvider(value));

    useEffect(() => setBundlePlaceholder(generateBundlePlaceholder(bundle)), [bundle, generateBundlePlaceholder]);

    return (
        <div className="field col-12 md:col-2 gap-field">
            <label htmlFor="bundle">Bundel</label>
            <Button id="bundle" type="button" severity="secondary" icon="pi pi-bookmark" label="Bundel" onClick={(e) => overlayPanel.current?.toggle(e)} />
            <OverlayPanel ref={overlayPanel} showCloseIcon>
                <div className="p-fluid formgrid grid gap-field-parent">
                    <div className="field col-12 gap-field">
                        <label htmlFor="bundleUnit">Satuan</label>
                        <Dropdown id="bundleUnit" optionLabel="name" placeholder="Satuan bundel" value={getUnitDetail(bundle?.node?.unit || units[0]?.code)} options={units} onChange={handleUnitChange} />
                    </div>
                    <div className="field col-12 gap-field">
                        <label htmlFor="bundleAmount">Qty</label>
                        <InputNumber id="bundleAmount" placeholder={bundlePlaceholder} value={bundle?.contain?.amount || 0} min={0} maxFractionDigits={0} onValueChange={handleAmountChange} onChange={handleInputChange} />
                        <small>{bundlePlaceholder}</small>
                    </div>
                </div>
            </OverlayPanel>
        </div>
    );
};

export default FormOverlay;
