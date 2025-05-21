import { doCancelAction, toaster } from '@/lib/client.action';
import { SupplierDocument } from '@/models/supplier.schema';
import { SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useEffect, useState } from 'react';

const SupplierForm = ({ toast, mode, record, doSubmit }: { toast: Toast | null; mode: 'add' | 'edit'; record: SupplierDocument | undefined | null; doSubmit: (record: any, _id?: string) => Promise<SubmitResponse> }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitResponse = ({ saved, notices }: SubmitResponse) => {
        if (!saved) {
            setLoading(false);

            if (notices.length > 0) {
                toaster(
                    toast,
                    notices.map((detail) => ({ severity: 'warn', summary: 'Validasi gagal!', detail }))
                );
            } else {
                toaster(toast, [{ severity: 'warn', summary: 'Gagal simpan!', detail: 'Data tidak dapat disimpan oleh Sistem' }]);
            }
        } else {
            toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }], 'supplier');
        }
    };

    const doAction = async () => {
        const response = await doSubmit({ name, phone, address, ...(mode === 'edit' && { _id: record?._id }) }, `${record?._id || ''}`);
        handleSubmitResponse(response);
    };

    const submitAction = async () => {
        if (!loading) {
            setLoading(true);
            await doAction();
        }
    };

    useEffect(() => {
        if (record) {
            setName(record.name || '');
            setAddress(record?.address || '');
            setPhone(record?.phone || '');
        }
    }, [record]);

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Supplier {mode === 'add' ? 'Baru' : record?.name}
            </h5>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 md:col-6 gap-field">
                    <label htmlFor="name">
                        Nama <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="name" type="text" value={name} onChange={({ target }) => setName(target.value)} />
                </div>
                <div className="field col-12 md:col-6 gap-field">
                    <label htmlFor="phone">Telepon/HP</label>
                    <InputText id="phone" type="text" value={phone} onChange={({ target }) => setPhone(target.value)} />
                </div>
                <div className="field col-12">
                    <label htmlFor="address">Alamat</label>
                    <InputTextarea id="address" rows={4} value={address} onChange={({ target }) => setAddress(target.value)} autoResize />
                </div>
            </div>
            <div className="flex justify-content-between flex-wrap">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => doCancelAction('supplier')} />
                <Button label="Simpan" icon="pi pi-check" className="form-action-button" onClick={async () => await submitAction()} />
            </div>
        </div>
    );
};

export default SupplierForm;
