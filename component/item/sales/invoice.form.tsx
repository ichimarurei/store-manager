import CustomerMiniForm from '@/component/customer/form.mini';
import { formatRp, handleFailedSave, isRestricted, toaster } from '@/lib/client.action';
import { SalesDocument } from '@/models/sales.schema';
import { submitting } from '@/mutations/submit';
import { getList } from '@/queries/get';
import { DropdownItem, SubmitResponse } from '@/types/app';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

dayjs.locale('id');

const payloadCustomer = validator.object({
    name: validator.pipe(validator.string('Nama pelanggan harus berupa huruf'), validator.nonEmpty('Nama pelanggan harus diisi'), validator.minLength(2, 'Nama pelanggan minimal 2 huruf')),
    address: validator.nullish(validator.string(), ''),
    city: validator.nullish(validator.string(), ''),
    phone: validator.nullish(validator.string(), '')
});

const doSubmitCustomer = async (record: any) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadCustomer, record, { abortPipeEarly: true });

    if (validated.success) {
        saved = await submitting('customer', record);
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const fetchCustomers = async () => {
    const customers: DropdownItem[] = [];

    try {
        const list = await getList('customer');
        customers.push(...list.map(({ _id, name }: any) => ({ name, code: _id })));
    } catch (_) {
        console.error(_);
    }

    customers.push({ code: 'add-new', name: 'Tambah Pelanggan Baru' });

    return customers;
};

const countTotal = (sub: number, tax: number) => {
    let final = 0;

    if (tax > 0) {
        final = sub + (tax / 100) * sub;
    } else {
        final = sub;
    }

    return Math.round(final);
};

const normalizeChange = (value: number) => (value < 0 ? 0 : value);

const InvoiceForm = ({ mode, record, products, doSubmit }: { mode: 'add' | 'edit'; record: SalesDocument | undefined | null; products: any[]; doSubmit: (record: any, _id?: string) => Promise<SubmitResponse> }) => {
    const [reference, setReference] = useState('');
    const [customer, setCustomer] = useState<DropdownItem | undefined>();
    const [date, setDate] = useState<Date | null>(null);
    const [customers, setCustomers] = useState<DropdownItem[]>([]);
    const [author, setAuthor] = useState<any>();
    const [visible, setVisible] = useState(false);
    const [locking, setLocking] = useState(false);
    const [subPrice, setSubPrice] = useState(0);
    const [tax, setTax] = useState(0);
    const [paid, setPaid] = useState(0);
    const toast = useRef<Toast | null>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const handleSubmitResponse = (submitted: SubmitResponse) => {
        if (submitted.saved) {
            toaster(toast.current, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }], 'sales');
        } else {
            setLocking(false);
            handleFailedSave(toast.current, submitted.notices);
        }
    };

    const buildBasePayload = () => {
        const finalPrice = countTotal(subPrice, tax);

        return { products, reference, date, subPrice, tax, finalPrice, paid, change: normalizeChange(paid - finalPrice), customer: customer?.code ?? null, operator: session?.user?.name };
    };

    const generatePayload = () => ({
        ...buildBasePayload(),
        ...(mode === 'edit' && { _id: record?._id, author: { ...author, created: { time: dayjs(author?.created?.time).toDate(), by: author.created?.by?._id } } })
    });

    const doAction = async () => {
        const response = await doSubmit(generatePayload(), `${record?._id ?? ''}`);
        handleSubmitResponse(response);
    };

    const getCustomers = async () => setCustomers(await fetchCustomers());

    const submitAction = async () => {
        if (!locking) {
            toast.current?.show({ severity: 'info', summary: 'Menyimpan', detail: 'Memproses penyimpanan data penjualan (barang keluar) ...' });
            setLocking(true);
            await doAction();
        }
    };

    useEffect(() => {
        getCustomers();
    }, []);

    useEffect(() => {
        setAuthor(record?.author ?? null);
        setReference(record?.reference ?? '');
        setTax(record?.tax ?? 0);
        setPaid(record?.paid ?? 0);
        setDate(record?.date ? dayjs(record?.date).toDate() : null);

        if (record?.customer) {
            setCustomer({ code: (record.customer as any)?._id, name: (record.customer as any)?.name });
        }
    }, [record]);

    useEffect(() => {
        let cost = 0;

        products.forEach(({ price, discount }) => {
            cost += discount > 0 ? price - (discount / 100) * price : price;
        });

        setSubPrice(cost);
    }, [products]);

    useEffect(() => {
        if (mode === 'edit') {
            setLocking(isRestricted(session)?.disabled); // only Super Admin have access to edit sales
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Faktur Penjualan {mode === 'add' ? 'Baru' : ''}
            </h5>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="date">Tanggal</label>
                    <Calendar showIcon showButtonBar readOnlyInput hideOnDateTimeSelect id="date" placeholder="Tanggal penjualan" dateFormat="dd/mm/yy" value={date} onChange={({ value }) => setDate(value ?? null)} />
                    {mode === 'add' && <small>Kosongkan untuk pengisian otomatis hari ini</small>}
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="reference">No Faktur</label>
                    <InputText id="reference" type="text" value={reference} onChange={({ target }) => setReference(target.value)} placeholder="Nomor faktur penjualan barang" />
                    {mode === 'add' && <small>Kosongkan untuk pengisian otomatis</small>}
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="sub-price">Sub Total</label>
                    <InputText readOnly disabled id="sub-price" placeholder="Nominal sub total" value={formatRp(subPrice)} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="ppn">PPN</label>
                    <div className="p-inputgroup flex-1">
                        <InputNumber id="ppn" placeholder="Nominal PPN" value={tax} min={0} maxFractionDigits={2} onChange={({ value }) => setTax(value ?? 0)} />
                        <span className="p-inputgroup-addon">%</span>
                    </div>
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="total-price">Total</label>
                    <InputText readOnly disabled id="total-price" placeholder="Nominal total" value={formatRp(countTotal(subPrice, tax))} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="paid-money">Bayar</label>
                    <InputNumber id="paid-money" placeholder="Nominal dibayar" value={paid} min={0} maxFractionDigits={0} mode="currency" currency="IDR" onChange={({ value }) => setPaid(value ?? 0)} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="change-price">Kembalian</label>
                    <InputText readOnly disabled id="change-price" placeholder="Nominal sisa/kembalian" value={formatRp(normalizeChange(paid - countTotal(subPrice, tax)))} />
                </div>
            </div>
            <hr />
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12">
                    <label htmlFor="customer">Pelanggan</label>
                    <Dropdown
                        filter
                        id="customer"
                        value={customer}
                        options={customers}
                        optionLabel="name"
                        placeholder="Pelanggan"
                        onChange={({ value }) => {
                            if (value?.code === 'add-new') {
                                setVisible(true);
                                setCustomer(undefined);
                            } else {
                                setCustomer(value);
                            }
                        }}
                    />
                </div>
            </div>
            <div className="flex justify-content-between flex-wrap gap-field-parent">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => router.replace('/sales')} />
                <Button
                    label="Simpan"
                    icon="pi pi-check"
                    className="form-action-button"
                    disabled={locking}
                    onClick={async () => {
                        if (paid >= countTotal(subPrice, tax)) {
                            await submitAction();
                        } else {
                            toast.current?.show({ severity: 'warn', summary: 'Gagal simpan!', detail: 'Nominal bayar tidak boleh kurang dari total' });
                        }
                    }}
                />
            </div>

            <Sidebar visible={visible} position="right" className="w-full md:w-25rem" onHide={() => setVisible(false)}>
                <h2>Pelanggan Baru</h2>
                <CustomerMiniForm toast={toast.current} setVisible={setVisible} doSubmit={doSubmitCustomer} reload={getCustomers} />
            </Sidebar>
            <Toast ref={toast} />
        </div>
    );
};

export default InvoiceForm;
