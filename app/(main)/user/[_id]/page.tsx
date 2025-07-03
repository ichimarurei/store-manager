'use client';

import UserForm from '@/component/user/form';
import { getDefaultPhoto, isRestricted, toaster } from '@/lib/client.action';
import { Privilege } from '@/lib/enum';
import { submitting } from '@/mutations/submit';
import { getData } from '@/queries/get';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const payloadSchema = validator.object({
    name: validator.pipe(validator.string('Nama profil harus berupa huruf'), validator.nonEmpty('Nama profil harus diisi'), validator.minLength(2, 'Nama profil minimal 2 huruf')),
    username: validator.pipe(validator.string('Nama akun (username) harus berupa huruf'), validator.nonEmpty('Nama akun (username) harus diisi'), validator.minLength(2, 'Nama akun (username) minimal 2 huruf')),
    password: validator.pipe(validator.string('Kata sandi (password) harus berupa huruf'), validator.nonEmpty('Kata sandi (password) harus diisi'), validator.minLength(2, 'Kata sandi (password) minimal 2 huruf')),
    active: validator.boolean('Status akun harus antara Aktif dan Tidak Aktif'),
    privilege: validator.enum(Privilege, 'Hak akses akun tidak terdaftar pada Sistem'),
    address: validator.nullish(validator.string(), ''),
    phone: validator.nullish(validator.string(), ''),
    photo: validator.nullish(validator.string(), getDefaultPhoto())
});

const doSubmit = async (record: any, _id?: string) => {
    let saved = false;
    let notices: string[] = [];
    const validated = validator.safeParse(payloadSchema, record, { abortPipeEarly: true });

    if (validated.success) {
        saved = await submitting('user', record, _id);
    } else {
        notices = validated.issues.map(({ message }) => message);
    }

    return { saved, notices };
};

const UserPage = ({ params }: { params: Promise<{ _id: string }> }) => {
    const [id, setId] = useState('baru');
    const [record, setRecord] = useState();
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast | null>(null);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetching = async () => {
            try {
                const { _id } = await params;

                if (_id && _id !== 'baru') {
                    setRecord(await getData('user', _id));
                }

                setId(_id);
                setLoading(false);
            } catch (_) {
                console.error(_);
                toaster(toast.current, [{ severity: 'error', summary: 'Gagal memuat data!', detail: 'Data tidak dapat dimuat oleh Sistem' }], 'user');
            }
        };

        setLoading(true);
        fetching();
    }, [params]);

    useEffect(() => {
        if (session) {
            const { disabled } = isRestricted(session);

            if (disabled) {
                router.replace('/');
            }
        }
    }, [router, session]);

    return (
        <div className="grid">
            <div className="col-12">{loading ? <Skeleton className="w-full h-screen" /> : <UserForm record={record} toast={toast.current} doSubmit={doSubmit} mode={id === 'baru' ? 'add' : 'edit'} />}</div>
            <Toast ref={toast} />
        </div>
    );
};

export default UserPage;
