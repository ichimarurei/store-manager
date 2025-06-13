import { handleFailedSave, toaster } from '@/lib/client.action';
import { CategoryDocument } from '@/models/category.schema';
import { SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { SetStateAction, useEffect, useState } from 'react';

const CategoryForm = ({
    toast,
    mode,
    record,
    doSubmit,
    setVisible
}: {
    toast: Toast | null;
    mode: 'add' | 'edit';
    record: CategoryDocument | undefined | null;
    doSubmit: (record: any, _id?: string) => Promise<SubmitResponse>;
    setVisible: (value: SetStateAction<boolean>) => void;
}) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitResponse = (submitted: SubmitResponse) => {
        if (submitted.saved) {
            toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }]);
            setVisible(false);
        } else {
            setLoading(false);
            handleFailedSave(toast, submitted.notices);
        }
    };

    const doAction = async () => {
        const response = await doSubmit({ name, ...(mode === 'edit' && { _id: record?._id }) }, `${record?._id ?? ''}`);
        handleSubmitResponse(response);
    };

    const submitAction = async () => {
        if (!loading) {
            toast?.show({ severity: 'info', summary: 'Menyimpan', detail: 'Memproses penyimpanan data kategori barang ...' });
            setLoading(true);
            await doAction();
        }
    };

    useEffect(() => {
        if (record) {
            setName(record.name ?? '');
        }
    }, [record]);

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Kategori Barang {mode === 'add' ? 'Baru' : record?.name}
            </h5>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="name">
                        Kategori <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="name" type="text" value={name} onChange={({ target }) => setName(target.value)} />
                </div>
            </div>
            <div className="flex justify-content-between flex-wrap">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => setVisible(false)} />
                <Button label="Simpan" icon="pi pi-check" className="form-side-button" disabled={loading} onClick={async () => await submitAction()} />
            </div>
        </div>
    );
};

export default CategoryForm;
