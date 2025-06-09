import SupplierMiniForm from '@/component/supplier/form.mini';
import { ReceiptDocument } from '@/models/receipt.schema';
import { DropdownItem, SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSupplier = validator.object({
    name: validator.pipe(validator.string('Nama supplier harus berupa huruf'), validator.nonEmpty('Nama supplier harus diisi'), validator.minLength(2, 'Nama supplier minimal 2 huruf')),
    address: validator.nullish(validator.string(), ''),
    phone: validator.nullish(validator.string(), '')
});

const doSubmitSupplier = async (record: any) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadSupplier, record, { abortPipeEarly: true });

    if (validated.success) {
        try {
            const response = await fetch('/api/supplier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            const result = await response.json();
            saved = result?.saved || false;
        } catch (_) {}
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const fetchSuppliers = async () => {
    const suppliers: DropdownItem[] = [];

    try {
        const response = await fetch('/api/supplier', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
        const list = await response.json();
        suppliers.push(...list.map(({ _id, name }: any) => ({ name, code: _id })));
    } catch (_) {}

    suppliers.push({ code: 'add-new', name: 'Tambah Supplier Baru' });

    return suppliers;
};

const InvoiceForm = ({ mode, record, doSubmit }: { mode: 'add' | 'edit'; record: ReceiptDocument | undefined | null; doSubmit: (record: any, _id?: string) => Promise<SubmitResponse> }) => {
    const [reference, setReference] = useState('');
    const [supplier, setSupplier] = useState<DropdownItem | undefined>();
    const [date, setDate] = useState<Date | null>(null);
    const [suppliers, setSuppliers] = useState<DropdownItem[]>([]);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast | null>(null);

    const getSuppliers = async () => setSuppliers(await fetchSuppliers());

    const submitAction = async () => {
        if (!loading) {
            setLoading(true);
            // todo: submit action code here ...
            setLoading(false);
        }
    };

    useEffect(() => {
        getSuppliers();
    }, []);

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Faktur Pengadaan {mode === 'add' ? 'Baru' : ''}
            </h5>
            {mode === 'edit' && (
                <p>
                    <mark>{record?.reference}</mark>
                </p>
            )}
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="date">Tanggal</label>
                    <Calendar showIcon showButtonBar readOnlyInput hideOnDateTimeSelect id="date" placeholder="Tanggal pengadaan" dateFormat="dd/mm/yy" value={date} onChange={({ value }) => setDate(value || null)} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="reference">No Faktur</label>
                    <InputText id="reference" type="text" value={reference} onChange={({ target }) => setReference(target.value)} placeholder="Nomor faktur pengadaan barang" />
                    <small>Kosongkan untuk pengisian otomatis</small>
                </div>
            </div>
            <hr />
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12">
                    <label htmlFor="supplier">Supplier</label>
                    <Dropdown
                        filter
                        id="supplier"
                        value={supplier ?? suppliers[0]}
                        options={suppliers}
                        optionLabel="name"
                        placeholder="Supplier/Pemasok"
                        onChange={({ value }) => {
                            if (value?.code === 'add-new') {
                                setVisible(true);
                                setSupplier(undefined);
                            } else {
                                setSupplier(value);
                            }
                        }}
                    />
                </div>
            </div>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12">
                    <Button label="Simpan" onClick={async () => await submitAction()} />
                </div>
            </div>
            <Sidebar visible={visible} position="right" className="w-full md:w-25rem" onHide={() => setVisible(false)}>
                <h2>Supplier Baru</h2>
                <SupplierMiniForm toast={toast.current} setVisible={setVisible} doSubmit={doSubmitSupplier} reload={getSuppliers} />
            </Sidebar>
            <Toast ref={toast} />
        </div>
    );
};

export default InvoiceForm;
