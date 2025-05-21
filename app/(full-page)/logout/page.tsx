'use client';

import { useStateStore } from '@/state/store';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LogoutPage = () => {
    const router = useRouter();
    const { env: envValues } = useStateStore();

    useEffect(() => {
        const logout = async () => {
            await signOut({ redirect: false });
            router.replace('/auth');
        };

        logout();
    }, [router]);

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={envValues.application.logo} alt={`${envValues.application.short} logo`} className="mb-5 w-6rem flex-shrink-0 border-round-2xl" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, rgba(233, 30, 99, 0.4) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style={{ borderRadius: '53px' }}>
                        <div className="flex justify-content-center align-items-center bg-pink-500 border-circle" style={{ height: '3.2rem', width: '3.2rem' }}>
                            <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
                        </div>
                        <h1 className="text-900 font-bold text-5xl mb-2">Logout</h1>
                        <div className="text-600 mb-5">Memproses permintaan logout/sign-out dari sistem</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutPage;
