import { doCancelAction, getDefaultPhoto, provideValidPassword, toaster } from '@/lib/client.action';
import { Privilege } from '@/lib/enum';
import { UserDocument } from '@/models/user.schema';
import { DropdownItem, SubmitResponse } from '@/types/app';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, FileUploadUploadEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { useEffect, useState } from 'react';

const privileges: DropdownItem[] = [
    { name: Privilege.Admin, code: Privilege.Admin },
    { name: Privilege.SuperAdmin, code: Privilege.SuperAdmin }
];

const UserForm = ({ toast, mode, record, doSubmit }: { toast: Toast | null; mode: 'add' | 'edit'; record: UserDocument | undefined | null; doSubmit: (record: any, _id?: string) => Promise<SubmitResponse> }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [active, setActive] = useState(true);
    const [photo, setPhoto] = useState(getDefaultPhoto());
    const [privilege, setPrivilege] = useState<DropdownItem | undefined>();
    const [loading, setLoading] = useState(false);

    const setBasicInfo = (record: UserDocument) => {
        setName(record.name || '');
        setAddress(record?.address || '');
        setPhone(record?.phone || '');
        setPhoto(record?.photo || getDefaultPhoto());
    };

    const setAccessInfo = (record: UserDocument) => {
        setUsername(record.username);
        setPassword(record.password);
        setActive(record?.active || false);
        setPrivilege(privileges.find(({ code }) => code === record?.privilege) || privileges[0]);
    };

    useEffect(() => {
        if (record) {
            setBasicInfo(record);
            setAccessInfo(record);
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
                detail = 'Foto berhasil diunggah';
                setPhoto(image);
            }
        } catch (_) {}

        toast?.show({ severity, summary, detail, life: 3000 });
    };

    const submitAction = async () => {
        if (!loading) {
            setLoading(true);
            const { saved, notices } = await doSubmit(
                {
                    name,
                    username,
                    phone,
                    photo,
                    address,
                    active,
                    password: provideValidPassword(password),
                    privilege: privilege?.code || privileges[0].code,
                    ...(mode === 'edit' && { _id: record?._id })
                },
                `${record?._id || ''}`
            );

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
                toaster(toast, [{ severity: 'success', summary: 'Berhasil simpan', detail: 'Data berhasil disimpan di Sistem' }], 'user');
            }
        }
    };

    return (
        <div className="card">
            <h5>
                {mode === 'add' ? 'Buat' : 'Ubah'} Akun {mode === 'add' ? 'Baru' : record?.username}
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
                <div className="field col-12 gap-field">
                    <label htmlFor="address">Alamat</label>
                    <InputTextarea id="address" rows={4} value={address} onChange={({ target }) => setAddress(target.value)} autoResize />
                </div>
                <div className="field col-12 md:col-6 gap-field">
                    <label htmlFor="username">
                        Nama Akun <sup className="text-red-500">*</sup>
                    </label>
                    <InputText id="username" type="text" placeholder="Username" value={username} onChange={({ target }) => setUsername(target.value)} readOnly={mode === 'edit'} />
                </div>
                <div className="field col-12 md:col-6 gap-field">
                    <label htmlFor="password">
                        Sandi <sup className="text-red-500">*</sup>
                    </label>
                    <Password id="password" type="text" placeholder="Password" value={password} onChange={({ target }) => setPassword(target.value)} toggleMask />
                    {mode === 'edit' && <small>Sandi yang ditampilkan sudah dienkripsi</small>}
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="privilege">Hak Akses</label>
                    <Dropdown id="privilege" value={privilege ?? privileges[0]} onChange={(e) => setPrivilege(e.value)} options={privileges} optionLabel="name" placeholder="Hak/level akses user" />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="active">Status</label>
                    <br />
                    <InputSwitch inputId="active" checked={active} onChange={(e) => setActive(e.value)} /> <br />
                    <small>status {active ? 'aktif' : 'tidak aktif'}</small>
                </div>
            </div>
            <div className="p-fluid formgrid grid gap-field-parent">
                <div className="field col-12 md:col-4">
                    <label>Foto Profil</label>
                    <div className="flex justify-content-center">
                        <Image src={photo} alt="Foto profil" width="250" preview />
                    </div>
                </div>
                <div className="field col-12 md:col-8">
                    <FileUpload
                        mode="advanced"
                        name="files"
                        url="/api/upload/user"
                        accept="image/*"
                        chooseLabel="Pilih Gambar/Foto"
                        emptyTemplate={<p className="m-0">Drag & drop gambar ke area ini untuk mengunggah.</p>}
                        onUpload={doneUpload}
                        multiple={false}
                        maxFileSize={5242880}
                        auto
                    />
                </div>
            </div>
            <div className="flex justify-content-between flex-wrap">
                <Button label="Batal" icon="pi pi-times" severity="info" onClick={() => doCancelAction('user')} />
                <Button label="Simpan" icon="pi pi-check" className="form-action-button" onClick={async () => await submitAction()} />
            </div>
        </div>
    );
};

export default UserForm;
