import { doCancelAction, getDefaultProduct, toaster } from '@/lib/client.action';
import { IBundling } from '@/models/bundling';
import { ProductDocument } from '@/models/product.schema';
import { DropdownItem, SubmitResponse } from '@/types/app';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Types } from 'mongoose';
import { useSession } from 'next-auth/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useEffect, useState } from 'react';
import FormOverlay from './overlay';
import FormUploader from './uploader';

dayjs.locale('id');

const createLogEntry = (activity: any, action: string): any => ({ name: activity?.by?.name, time: dayjs(activity?.time).format('DD MMM YYYY HH:mm:ss'), action });

const createLogs = (author: any): any[] => {
    const createdLog = createLogEntry(author.created, 'Dibuat');
    const editedLog = author.edited ? createLogEntry(author.edited, 'Diubah') : null;

    return [createdLog, ...(editedLog ? [editedLog] : [])];
};

const ProductForm = ({ toast, mode, record, doSubmit }: { toast: Toast | null; mode: 'add' | 'edit'; record: ProductDocument | undefined | null; doSubmit: (record: any, _id?: string) => Promise<SubmitResponse> }) => {
    const [name, setName] = useState('');
    const [images, setImages] = useState<string[]>([getDefaultProduct()]);
    const [category, setCategory] = useState<Types.ObjectId | undefined>();
    const [unit, setUnit] = useState<Types.ObjectId | undefined>();
    const [bundle, setBundle] = useState<IBundling | undefined | null>();
    const [author, setAuthor] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<DropdownItem[]>([]);
    const [units, setUnits] = useState<DropdownItem[]>([]);
    const [visible, setVisible] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const { data: session } = useSession();

    const setLogInfo = (author?: any | null) => setLogs(createLogs(author));

    const setBasicInfo = (record: ProductDocument) => {
        const pictures = record?.images ?? [];

        if (!pictures.length) {
            pictures.push(getDefaultProduct());
        }

        setName(record.name ?? '');
        setImages(pictures);
    };

    const setReferenceInfo = (record: ProductDocument) => {
        setCategory(record.category?._id);
        setUnit(record.unit?._id);
        setAuthor(record?.author ?? null);
        setLogInfo(record?.author);
    };

    const setBundling = (record: ProductDocument) =>
        setBundle(
            record?.bundle
                ? {
                      contain: { amount: record?.bundle?.contain?.amount, unit: record?.bundle?.contain?.unit?._id },
                      node: { amount: record?.bundle?.node?.amount, unit: record?.bundle?.node?.unit?._id }
                  }
                : null
        );

    const payloadOptionals = () => ({ category: category ?? categories[0]?.code, unit: unit ?? units[0]?.code });

    const payloadBundle = () => ({ bundle: (bundle?.contain?.amount ?? 0) >= 1 ? bundle : null });

    const generatePayload = () => ({
        name,
        images,
        operator: session?.user?.name,
        ...payloadOptionals(),
        ...payloadBundle(),
        ...(mode === 'edit' && { _id: record?._id, author: { ...author, created: { time: dayjs(author?.created?.time).toDate(), by: author.created?.by?._id } } })
    });

    const submitAction = async () => {
        if (!loading) {
            toast?.show({ severity: 'info', summary: 'Menyimpan', detail: 'Memproses penyimpanan data produk ...' });
            setLoading(true);
            const { saved, notices } = await doSubmit(generatePayload(), `${record?._id ?? ''}`);

            if (!saved) {
                setLoading(false);

                if (notices.length > 0) {
                    notices.forEach((detail) => toast?.show({ severity: 'warn', summary: 'Validasi gagal!', detail }));
                } else {
                    toast?.show({ severity: 'warn', summary: 'Gagal simpan!', detail: 'Data tidak dapat disimpan oleh Sistem' });
                }
            } else {
                toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }], 'product');
            }
        }
    };

    useEffect(() => {
        if (record) {
            setBasicInfo(record);
            setReferenceInfo(record);
            setBundling(record);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record]);

    useEffect(() => {
        const fetching = async (fetchFor: 'category' | 'unit') => {
            try {
                const response = await fetch(`/api/${fetchFor}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
                const result: any[] = await response.json();

                if (fetchFor === 'category') {
                    setCategories(result.map(({ _id, name }) => ({ name, code: _id })));
                } else {
                    setUnits(result.map(({ _id, name }) => ({ name, code: _id })));
                }
            } catch (_) {
                console.error(_);
            }
        };

        fetching('category');
        fetching('unit');
    }, []);

    return (
        <div className="card">
            {mode === 'add' && <h5>Buat Produk Baru</h5>}
            {mode === 'edit' && (
                <>
                    <div className="flex align-items-center justify-content-between">
                        <h5>Ubah Produk {record?.name}</h5>
                        <Button aria-label="Riwayat Pendataan" icon="pi pi-history" rounded text severity="help" onClick={() => setVisible(true)} tooltip="Riwayat Pendataan" tooltipOptions={{ position: 'left' }} />
                    </div>
                    <Sidebar visible={visible} position="right" className="w-full md:w-25rem" onHide={() => setVisible(false)}>
                        <h2>Riwayat Pendataan</h2>
                        <DataTable value={logs} size="small" showGridlines stripedRows>
                            <Column field="action" header="Status" />
                            <Column field="name" header="Operator" />
                            <Column field="time" header="Waktu" />
                        </DataTable>
                    </Sidebar>
                </>
            )}
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="name">
                        Nama <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="name" type="text" value={name} onChange={({ target }) => setName(target.value)} />
                </div>
                <div className="field col-12 md:col-5 gap-field">
                    <label htmlFor="category">
                        Kategori Produk <sup className="text-red-500">*</sup>
                    </label>
                    <Dropdown id="category" optionLabel="name" value={categories.find(({ code }) => code === category) ?? categories[0]} options={categories} onChange={(e) => setCategory(e.value?.code)} />
                </div>
                <div className="field col-12 md:col-5 gap-field">
                    <label htmlFor="unit">
                        Satuan Produk <sup className="text-red-500">*</sup>
                    </label>
                    <Dropdown id="unit" optionLabel="name" value={units.find(({ code }) => code === unit) ?? units[0]} options={units} onChange={(e) => setUnit(e.value?.code)} />
                </div>
                <FormOverlay units={units} unit={unit} setBundle={setBundle} {...(bundle && { bundle })} />
            </div>
            <FormUploader toast={toast} setImages={setImages} images={images} />
            <div className="flex justify-content-between flex-wrap">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => doCancelAction('product')} />
                <Button label="Simpan" icon="pi pi-check" className="form-action-button" disabled={loading} onClick={async () => await submitAction()} />
            </div>
        </div>
    );
};

export default ProductForm;
