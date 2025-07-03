'use client';

import { LayoutContext } from '@/layout/context/layoutcontext';
import { getAppInfo } from '@/lib/client.action';
import { useStateStore } from '@/state/store';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { useContext, useEffect, useRef, useState } from 'react';
import * as validator from 'valibot';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showInstallLink, setShowInstallLink] = useState(false);
    const [prompt, setPrompt] = useState<any>(null);
    const toast = useRef<Toast>(null);
    const { layoutConfig } = useContext(LayoutContext);
    const { env: envValues, setAppInfo } = useStateStore();
    const { data: session, status: authorizing } = useSession();
    const router = useRouter();

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const payloadSchema = validator.object({
        username: validator.pipe(validator.string('Nama akun harus berupa huruf'), validator.nonEmpty('Nama akun harus diisi'), validator.minLength(2, 'Nama akun minimal 2 huruf')),
        password: validator.pipe(validator.string('Sandi harus berupa huruf'), validator.nonEmpty('Sandi harus diisi'), validator.minLength(2, 'Sandi minimal 2 huruf'))
    });

    const doSign = async () => {
        let notices: string[] = [];
        const validated = validator.safeParse(payloadSchema, { username, password }, { abortPipeEarly: true });

        if (validated.success) {
            const response = await signIn('credentials', { username, password, redirect: false });

            if (!response?.ok) {
                toast.current?.show({
                    life: 3000,
                    severity: 'error',
                    summary: 'Akses ditolak!',
                    detail: 'Akun tidak ditemukan'
                });
            } else {
                window.location.href = '/dashboard';
            }
        } else {
            notices = validated.issues.map(({ message }) => message);
        }

        if (notices.length > 0) {
            notices.forEach((detail) =>
                toast.current?.show({
                    life: 3000,
                    severity: 'warn',
                    summary: 'Validasi gagal!',
                    detail
                })
            );
        }
    };

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [router, session]);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setPrompt(e);

            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setShowInstallLink(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    useEffect(() => {
        const fetchAppInfo = async () => {
            const info = await getAppInfo();

            if (info) {
                setAppInfo({ name: info.name, logo: info?.logo ?? envValues.application.logo });
            }
        };

        fetchAppInfo();
    }, [envValues.application.logo, setAppInfo]);

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={envValues.application.logo} alt={`${envValues.application.short} logo`} className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <Toast ref={toast} />

                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">{envValues.application.name}</div>
                            <span className="text-600 font-medium">{envValues.application.description}</span>
                        </div>

                        {authorizing === 'loading' && <Skeleton width="100%" height="30em" />}

                        {authorizing === 'unauthenticated' && (
                            <div>
                                <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                    Akun
                                </label>
                                <InputText
                                    id="username"
                                    type="text"
                                    placeholder="Nama akun"
                                    className="w-full md:w-30rem mb-5"
                                    style={{ padding: '1rem' }}
                                    value={username}
                                    onChange={({ target }) => setUsername(target.value)}
                                    onKeyDown={async ({ key }) => key === 'Enter' && (await doSign())}
                                />

                                <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                    Sandi
                                </label>
                                <Password
                                    inputId="password"
                                    value={password}
                                    placeholder="Kata sandi"
                                    toggleMask
                                    className="w-full mb-5"
                                    inputClassName="w-full p-3 md:w-30rem"
                                    onChange={({ target }) => setPassword(target.value)}
                                    onKeyDown={async ({ key }) => key === 'Enter' && (await doSign())}
                                />

                                {showInstallLink && (
                                    <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                        <Link
                                            href={'#'}
                                            className="font-medium no-underline ml-2 text-right cursor-pointer"
                                            style={{ color: 'var(--primary-color)' }}
                                            onClick={(e) => {
                                                e.preventDefault();

                                                if (prompt) {
                                                    prompt.prompt();
                                                    prompt.useChoice.then((_: any) => {
                                                        setPrompt(null);
                                                    });
                                                }
                                            }}
                                        >
                                            Pasang sebagai Web App
                                        </Link>
                                    </div>
                                )}

                                <div className="flex align-items-center justify-content-between mb-5 gap-5" />
                                <Button label="Akses" className="w-full p-3 text-xl" onClick={async () => await doSign()} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
