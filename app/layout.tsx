'use client';

import { LayoutProvider } from '@/layout/context/layoutcontext';
import { useStateStore } from '@/state/store';
import '@/styles/_custom.scss';
import '@/styles/layout/layout.scss';
import { SessionProvider } from 'next-auth/react';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const envValues = useStateStore((state) => state.env);

    return (
        <SessionProvider>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <meta name="application-name" content={envValues.application.name} />
                    <meta name="description" content={envValues.application.description} />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="msapplication-TileColor" content="#111827" />
                    <meta name="msapplication-tap-highlight" content="no" />
                    <meta name="theme-color" content="#6366F1" />
                    <meta name="viewport" content="initial-scale=1, viewport-fit=cover, width=device-width"></meta>
                    <link rel="stylesheet" id="theme-css" href={`/themes/lara-light-blue/theme.css`}></link>
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="icon" type="image/png" sizes="192x192" href="/images/logo-192x192.png" />
                    <link rel="icon" type="image/png" sizes="512x512" href="/images/logo-512x512.png" />

                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content={envValues.application.name} />
                    <link rel="apple-touch-icon" href="/images/logo-192x192.png" />
                    <link rel="apple-touch-icon" sizes="192x192" href="/images/logo-192x192.png" />
                    <link rel="apple-touch-icon" sizes="512x512" href="/images/logo-512x512.png" />

                    <meta name="twitter:card" content={envValues.application.short} />
                    <meta name="twitter:url" content={envValues.application.url} />
                    <meta name="twitter:title" content={envValues.application.name} />
                    <meta name="twitter:description" content={envValues.application.description} />
                    <meta name="twitter:image" content={`${envValues.application.url}/images/logo-512x512.png`} />
                    <meta name="twitter:creator" content="jms21maru@gmail.com" />

                    <meta property="og:type" content="website" />
                    <meta property="og:title" content={envValues.application.name} />
                    <meta property="og:description" content={envValues.application.description} />
                    <meta property="og:site_name" content={envValues.application.short} />
                    <meta property="og:url" content={envValues.application.url} />
                    <meta property="og:image" content={`${envValues.application.url}/images/logo-512x512.png`} />
                </head>
                <body>
                    <PrimeReactProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </PrimeReactProvider>
                </body>
            </html>
        </SessionProvider>
    );
}
