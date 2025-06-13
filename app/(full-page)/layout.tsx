import { Metadata } from 'next';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_DESCRIPTION,
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    icons: { icon: '/favicon.ico' },
    openGraph: {
        type: 'website',
        title: process.env.NEXT_PUBLIC_APP_NAME,
        url: process.env.NEXT_PUBLIC_BASE_URL,
        description: process.env.NEXT_PUBLIC_DESCRIPTION,
        images: [`${process.env.NEXT_PUBLIC_BASE_URL}/images/logo-512x512.png`],
        ttl: 604800
    }
};

export default function SimpleLayout({ children }: Readonly<SimpleLayoutProps>) {
    return <React.Fragment>{children}</React.Fragment>;
}
