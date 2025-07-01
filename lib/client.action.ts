'user client';

import { InfoDocument } from '@/models/info.schema';
import { ProductDocument } from '@/models/product.schema';
import { createHash } from 'crypto';
import { isEmpty, isNaN } from 'lodash';
import { Toast } from 'primereact/toast';

const getDefaultImage = (name: string) => `/storage/image/global/${name}.jpg`;
const parseUnit = (item: any) => ({ code: item?._id, name: item?.name });
const getUnitDetail = (item: any, unit: string) => (item?._id === unit ? item : null);

export const doCancelAction = (path: string) => (window.location.href = `/${path}`);

export const getDefaultLogo = () => getDefaultImage('logo');

export const getDefaultPhoto = () => getDefaultImage('photo');

export const getDefaultProduct = () => getDefaultImage('product');

export const formatRp = (value = 0, discount = 0) => {
    let rpString = 'Rp 0';

    try {
        if (!isNaN(value)) {
            let final = value;

            if (discount > 0) {
                final = value - (discount / 100) * value;
            }

            rpString = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(final).replace(',00', '').replace('Rp', 'Rp ');
        } else {
            rpString = 'Rp 0.00';
        }
    } catch (_) {
        console.error(_);
    }

    return rpString;
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

    return hashed ?? '';
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
    } catch (_) {
        console.error(_);
    }

    return info;
};

export const pickUnitDetail = (item: any, unit: string) => {
    let unitDetail = getUnitDetail(item?.unit, unit);
    unitDetail ??= getUnitDetail(item?.bundle?.node?.unit, unit);

    return unitDetail;
};

export const initUnits = (item: ProductDocument) => {
    const options = [parseUnit(item?.unit)];

    if (item?.bundle) {
        options.push(parseUnit(item.bundle.node?.unit));
    }

    return options;
};

export const handleFailedSave = (toast: Toast | null, notices: string[]) => {
    if (notices.length > 0) {
        toaster(
            toast,
            notices.map((detail) => ({ severity: 'warn', summary: 'Validasi gagal!', detail }))
        );
    } else {
        toaster(toast, [{ severity: 'warn', summary: 'Gagal simpan!', detail: 'Data tidak dapat disimpan oleh Sistem' }]);
    }
};

export const calculateSumCost = (products: any[]) => {
    let sumCost = 0;

    products.forEach((item) => {
        let amount = item?.cost ?? item?.price ?? 0;

        if (item?.discount > 0) {
            amount = amount - (item?.discount / 100) * amount;
        }

        sumCost += amount;
    });

    return sumCost;
};

export const processRangePrice = (cost: number[]) => {
    let costString = '';

    if (!isEmpty(cost)) {
        costString = cost?.[1] ? `${formatRp(cost[0])} - ${formatRp(cost[1])}` : formatRp(cost?.[0] || 0);

        if (cost[0] === cost[1]) {
            costString = formatRp(cost[0]);
        }

        if (cost[0] === 0) {
            costString = formatRp(cost[1]);
        }
    }

    return costString;
};
