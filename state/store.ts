'use client';

import { create } from 'zustand';

export type StoreENV = {
    env: {
        application: {
            name?: string;
            short?: string;
            description?: string;
            url?: string;
            logo?: string;
        };
    };
    version: { name: string; tag: string };
    setAppInfo: ({ name, logo }: { name: string; logo?: string }) => void;
};

export const useStateStore = create<StoreENV>((set) => ({
    env: {
        application: {
            name: process.env.NEXT_PUBLIC_APP_NAME,
            short: process.env.NEXT_PUBLIC_SHORT_NAME,
            description: process.env.NEXT_PUBLIC_DESCRIPTION,
            url: process.env.NEXT_PUBLIC_BASE_URL,
            logo: '/images/logo.png' // default
        }
    },
    version: { name: 'Store Manager', tag: 'v.1.0.1' },
    setAppInfo: ({ name, logo }: { name: string; logo?: string }) => set(({ env, version }) => ({ version, env: { application: { ...env.application, name, logo } } }))
}));
