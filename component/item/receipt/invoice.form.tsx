import SupplierMiniForm from '@/component/supplier/form.mini';
import { handleFailedSave, isRestricted, toaster } from '@/lib/client.action';
import { ReceiptDocument } from '@/models/receipt.schema';
import { DropdownItem, SubmitResponse } from '@/types/app';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

dayjs.locale('id');

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
            saved = result?.saved ?? false;
        } catch (_) {
            console.error(_);
        }
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
    } catch (_) {
        console.error(_);
    }

    suppliers.push({ code: 'add-new', name: 'Tambah Supplier Baru' });

    return suppliers;
};

const InvoiceForm = ({ mode, record, products, doSubmit }: { mode: 'add' | 'edit'; record: ReceiptDocument | undefined | null; products: any[]; doSubmit: (record: any, _id?: string) => Promise<SubmitResponse> }) => {
    const [reference, setReference] = useState('');
    const [supplier, setSupplier] = useState<DropdownItem | undefined>();
    const [date, setDate] = useState<Date | null>(null);
    const [suppliers, setSuppliers] = useState<DropdownItem[]>([]);
    const [author, setAuthor] = useState<any>();
    const [visible, setVisible] = useState(false);
    const [locking, setLocking] = useState(false);
    const toast = useRef<Toast | null>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const handleSubmitResponse = (submitted: SubmitResponse) => {
        if (submitted.saved) {
            toaster(toast.current, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }], 'receipt');
        } else {
            setLocking(false);
            handleFailedSave(toast.current, submitted.notices);
        }
    };

    const buildBasePayload = () => ({ products, reference, date, supplier: supplier?.code ?? suppliers[0].code, operator: session?.user?.name });

    const generatePayload = (isSyncStock: boolean) => ({
        ...buildBasePayload(),
        ...(isSyncStock && { syncStock: true }),
        ...(mode === 'edit' && { _id: record?._id, author: { ...author, created: { time: dayjs(author?.created?.time).toDate(), by: author.created?.by?._id } } })
    });

    const doAction = async (isSyncStock: boolean) => {
        const response = await doSubmit(generatePayload(isSyncStock), `${record?._id ?? ''}`);
        handleSubmitResponse(response);
    };

    const getSuppliers = async () => setSuppliers(await fetchSuppliers());

    const submitAction = async (isSyncStock?: boolean) => {
        if (!locking) {
            toast.current?.show({ severity: 'info', summary: 'Menyimpan', detail: 'Memproses penyimpanan data barang masuk ...' });
            setLocking(true);
            await doAction(isSyncStock ?? false);
        }
    };

    useEffect(() => {
        getSuppliers();
    }, []);

    useEffect(() => {
        setAuthor(record?.author ?? null);
        setReference(record?.reference ?? '');
        setDate(record?.date ? dayjs(record?.date).toDate() : null);

        if (record?.supplier) {
            setSupplier({ code: (record.supplier as any)?._id, name: (record.supplier as any)?.name });
        }
    }, [record]);

    useEffect(() => {
        if (mode === 'edit') {
            setLocking(isRestricted(session)?.disabled); // only Super Admin have access to edit receipt
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Faktur Pengadaan {mode === 'add' ? 'Baru' : ''}
            </h5>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="date">Tanggal</label>
                    <Calendar showIcon showButtonBar readOnlyInput hideOnDateTimeSelect id="date" placeholder="Tanggal pengadaan" dateFormat="dd/mm/yy" value={date} onChange={({ value }) => setDate(value ?? null)} />
                    {mode === 'add' && <small>Kosongkan untuk pengisian otomatis hari ini</small>}
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="reference">No Faktur</label>
                    <InputText id="reference" type="text" value={reference} onChange={({ target }) => setReference(target.value)} placeholder="Nomor faktur pengadaan barang" />
                    {mode === 'add' && <small>Kosongkan untuk pengisian otomatis</small>}
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
            <div className="flex justify-content-between flex-wrap gap-field-parent">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => router.replace('/receipt')} />
                <Button label="Simpan" icon="pi pi-check" className="form-action-button" disabled={locking} onClick={async () => await submitAction()} />
            </div>

            {isRestricted(session)?.visible && (
                <>
                    <hr />
                    <div className="p-fluid formgrid grid gap-field-parent">
                        <Button label="Simpan & Terima" severity="success" icon="pi pi-lock" className="form-action-button" disabled={locking} onClick={async () => await submitAction(true)} />
                    </div>
                </>
            )}

            <Sidebar visible={visible} position="right" className="w-full md:w-25rem" onHide={() => setVisible(false)}>
                <h2>Supplier Baru</h2>
                <SupplierMiniForm toast={toast.current} setVisible={setVisible} doSubmit={doSubmitSupplier} reload={getSuppliers} />
            </Sidebar>
            <Toast ref={toast} />
        </div>
    );
};

export default InvoiceForm;
