'user client';

import { InfoDocument } from '@/models/info.schema';
import { createHash } from 'crypto';
import { Toast } from 'primereact/toast';

const getDefaultImage = (name: string) => `/storage/image/global/${name}.jpg`;

export const doCancelAction = (path: string) => (window.location.href = `/${path}`);

export const getDefaultLogo = () => getDefaultImage('logo');

export const getDefaultPhoto = () => getDefaultImage('photo');

export const getDefaultProduct = () => getDefaultImage('product');

export const formatRp = (value = 0) => {
    try {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value).replace(',00', '');
    } catch (_) {
        return 'Rp 0';
    }
};

export const toaster = (toast: Toast | null, messages: { severity: 'success' | 'info' | 'warn' | 'error'; summary: string; detail: string }[], reload?: string) => {
    messages.forEach(({ severity, summary, detail }) => toast?.show({ life: 3000, severity, summary, detail }));

    if (reload) {
        setTimeout(() => doCancelAction(reload), 2500);
    }
};

export const provideValidPassword = (password?: string): string => {
    let hashed: string | null = null;

    if (password) {
        // Regular expression to match a valid MD5 hash, hash password if not valid md5 string
        if (/^[a-f0-9]{32}$/.test(password)) {
            hashed = password;
        } else {
            hashed = createHash('md5').update(password).digest('hex');
        }
    }

    return hashed || '';
};

export const isRestricted = (session?: any) => {
    const restrict = session?.user?.email !== 'Super Admin@store.manager-v.1.0.0';

    return { disabled: restrict, visible: !restrict };
};

export const getAppInfo = async (): Promise<InfoDocument | null> => {
    let info: InfoDocument | null = null;

    try {
        const response = await fetch('/api/info', { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
        info = await response.json();
    } catch (_) {}

    return info;
};
