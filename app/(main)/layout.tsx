import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Layout from '@/layout/layout';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';

interface AppLayoutProps {
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

export default async function AppLayout({ children }: AppLayoutProps) {
    const session = await getServerSession(authOptions);

    return session?.user && <Layout>{children}</Layout>;
}
