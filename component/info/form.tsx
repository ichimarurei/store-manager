import { doCancelAction, getDefaultLogo, toaster } from '@/lib/client.action';
import { InfoDocument } from '@/models/info.schema';
import { SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadUploadEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useEffect, useState } from 'react';

const linePlaceholder = 'dapat berisi kota domisili usaha, telepon, nomor WhatsApp, atau alamat URL website';

const renderInfo = (extra?: string) => (
    <small>
        <mark>#</mark> {extra && `${extra}, dan untuk `}keperluan pada Kop Faktur
    </small>
);

const InfoForm = ({ toast, record, doSubmit }: { toast: Toast | null; record: InfoDocument | undefined | null; doSubmit: (record: any) => Promise<SubmitResponse> }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [logo, setLogo] = useState(getDefaultLogo());
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [customer, setCustomer] = useState(0);
    const [supplier, setSupplier] = useState(0);
    const [loading, setLoading] = useState(false);

    const setBasicInfo = (record: InfoDocument) => {
        setName(record.name || '');
        setAddress(record?.address || '');
        setLogo(record?.logo || getDefaultLogo());
    };

    const setDetailInfo = (record: InfoDocument) => {
        setLine1(record?.about?.line1 || '');
        setLine2(record?.about?.line2 || '');
    };

    const setDebtInfo = (record: InfoDocument) => {
        setCustomer(record?.debtConfigFrom?.customer || 0);
        setSupplier(record?.debtConfigFrom?.supplier || 0);
    };

    useEffect(() => {
        if (record) {
            setBasicInfo(record);
            setDetailInfo(record);
            setDebtInfo(record);
        }
    }, [record]);

    const doneUpload = ({ xhr }: FileUploadUploadEvent) => {
        let severity: 'info' | 'warn' = 'warn';
        let summary: string = 'Gagal';
        let detail: string = 'Logo gagal diunggah';

        try {
            const image = JSON.parse(xhr.response)?.uploaded;

            if (image) {
                severity = 'info';
                summary = 'Berhasil';
                detail = 'Logo berhasil diunggah';
                setLogo(image);
            }
        } catch (_) {}

        toast?.show({ severity, summary, detail, life: 3000 });
    };

    return (
        <div className="card">
            <h5>Profil Usaha</h5>
            <p>
                Semua data profil usaha yang memiliki tanda <mark>#</mark> akan ditampilkan pada Kop Faktur dan yang tidak memiliki digunakan untuk tampilan pada sistem.
            </p>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 gap-field">
                    <label htmlFor="name">
                        Nama <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="name" type="text" value={name} onChange={({ target }) => setName(target.value)} />
                    {renderInfo()}
                </div>
                <div className="field col-12 gap-field">
                    <label htmlFor="address">Alamat</label>
                    <InputTextarea id="address" rows={4} value={address} onChange={({ target }) => setAddress(target.value)} autoResize />
                    {renderInfo()}
                </div>
                <div className="field col-12 md:col-6 gap-field">
                    <label htmlFor="line1">Info</label>
                    <InputText id="line1" type="text" placeholder="Baris pertama" value={line1} onChange={({ target }) => setLine1(target.value)} />
                    {renderInfo(linePlaceholder)}
                </div>
                <div className="field col-12 md:col-6 gap-field">
                    <label htmlFor="line2" className="hidden md:block">
                        &nbsp;
                    </label>
                    <InputText id="line2" type="text" placeholder="Baris kedua" value={line2} onChange={({ target }) => setLine2(target.value)} />
                    {renderInfo(linePlaceholder)}
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="supplier">Jatuh Tempo Hutang Pembelian</label>
                    <InputNumber id="supplier" placeholder="Nominal" value={supplier} onValueChange={(e) => setSupplier(e.value || 0)} min={0} maxFractionDigits={0} />
                    <small>*hari</small>
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="customer">Jatuh Tempo Hutang Pelanggan</label>
                    <InputNumber id="customer" placeholder="Nominal" value={customer} onValueChange={(e) => setCustomer(e.value || 0)} min={0} maxFractionDigits={0} />
                    <small>*hari</small>
                </div>
            </div>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 md:col-4">
                    <label>Logo</label>
                    <div className="flex justify-content-center">
                        <Image src={logo} alt="Logo" width="250" preview />
                    </div>
                </div>
                <div className="field col-12 md:col-8">
                    <FileUpload
                        mode="advanced"
                        name="files"
                        url="/api/upload/info"
                        accept="image/*"
                        chooseLabel="Pilih Gambar/Logo"
                        emptyTemplate={<p className="m-0">Drag & drop gambar ke area ini untuk mengunggah.</p>}
                        onUpload={doneUpload}
                        multiple={false}
                        maxFileSize={5242880}
                        auto
                    />
                </div>
            </div>
            <div className="flex justify-content-between flex-wrap">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => doCancelAction('info')} />
                <Button
                    label="Simpan"
                    icon="pi pi-check"
                    className="form-action-button"
                    onClick={async () => {
                        if (!loading) {
                            setLoading(true);
                            const { saved, notices } = await doSubmit({ name, address, logo, about: { line1, line2 }, debtConfigFrom: { customer, supplier }, _id: record?._id });

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
                                toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }], 'info');
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default InfoForm;
