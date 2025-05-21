import { toaster } from '@/lib/client.action';
import { UnitDocument } from '@/models/unit.schema';
import { SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { SetStateAction, useEffect, useState } from 'react';

const UnitForm = ({
    toast,
    mode,
    record,
    doSubmit,
    setVisible
}: {
    toast: Toast | null;
    mode: 'add' | 'edit';
    record: UnitDocument | undefined | null;
    doSubmit: (record: any, _id?: string) => Promise<SubmitResponse>;
    setVisible: (value: SetStateAction<boolean>) => void;
}) => {
    const [name, setName] = useState('');
    const [short, setShort] = useState('');
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
            toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }]);
            setVisible(false);
        }
    };

    const doAction = async () => {
        const response = await doSubmit({ name, short, ...(mode === 'edit' && { _id: record?._id }) }, `${record?._id || ''}`);
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
            setShort(record?.short || '');
        }
    }, [record]);

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Satuan Barang {mode === 'add' ? 'Baru' : record?.name}
            </h5>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="name">
                        Satuan <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="name" type="text" value={name} onChange={({ target }) => setName(target.value)} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="short">Singkatan</label>
                    <InputText id="short" type="text" value={short} onChange={({ target }) => setShort(target.value)} />
                </div>
            </div>
            <div className="flex justify-content-between flex-wrap">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => setVisible(false)} />
                <Button label="Simpan" icon="pi pi-check" className="form-side-button" onClick={async () => await submitAction()} />
            </div>
        </div>
    );
};

export default UnitForm;
