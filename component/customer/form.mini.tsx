import { handleFailedSave, toaster } from '@/lib/client.action';
import { SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useState } from 'react';

const CustomerMiniForm = ({ toast, doSubmit, setVisible, reload }: { toast: Toast | null; doSubmit: (record: any) => Promise<SubmitResponse>; setVisible: (visible: boolean) => void; reload: () => Promise<void> }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitResponse = async (submitted: SubmitResponse) => {
        setLoading(false);

        if (submitted.saved) {
            await reload();
            toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }]);
            setVisible(false);
        } else {
            handleFailedSave(toast, submitted.notices);
        }
    };

    const doAction = async () => {
        if (!loading) {
            setLoading(true);
            toast?.show({ severity: 'info', summary: 'Menyimpan', detail: 'Memproses penyimpanan data pelanggan ...' });
            const response = await doSubmit({ name, phone, address, city });
            handleSubmitResponse(response);
        }
    };

    return (
        <div className="card">
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="name">
                        Nama <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="name" type="text" value={name} onChange={({ target }) => setName(target.value)} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="phone">Telepon/HP</label>
                    <InputText id="phone" type="text" value={phone} onChange={({ target }) => setPhone(target.value)} />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="address">Alamat</label>
                    <InputTextarea id="address" rows={4} value={address} onChange={({ target }) => setAddress(target.value)} autoResize />
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="city">Kota</label>
                    <InputText id="city" type="text" value={city} onChange={({ target }) => setCity(target.value)} />
                </div>
            </div>
            <Button label="Simpan" icon="pi pi-check" className="form-action-button" disabled={loading} onClick={async () => await doAction()} />
        </div>
    );
};

export default CustomerMiniForm;
