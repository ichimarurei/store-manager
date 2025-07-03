import { isRestricted } from '@/lib/client.action';
import { AppMenuItem } from '@/types';
import { useSession } from 'next-auth/react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';

const AppMenu = () => {
    const { data: session } = useSession();
    const { disabled, visible } = isRestricted(session);

    const model: AppMenuItem[] = [
        {
            label: 'Dasbor',
            items: [
                { label: 'Beranda', icon: 'pi pi-fw pi-home', to: '/dashboard' },
                { label: 'Panduan', icon: 'pi pi-fw pi-question', to: '/guide' }
            ]
        },
        {
            label: 'Barang',
            items: [
                { label: 'Kategori', icon: 'pi pi-fw pi-tag', to: '/category' },
                { label: 'Satuan', icon: 'pi pi-fw pi-bookmark', to: '/unit' },
                { label: 'Produk', icon: 'pi pi-fw pi-box', to: '/product' },
                {
                    label: 'Stok',
                    icon: 'pi pi-fw pi-th-large',
                    items: [
                        { label: 'Aktual', icon: 'pi pi-fw pi-table', to: '/stock' },
                        { label: 'Masuk', icon: 'pi pi-fw pi-download', to: '/receipt' },
                        { label: 'Keluar', icon: 'pi pi-fw pi-upload', to: '/sales' }
                    ]
                }
            ]
        },
        {
            label: 'Master',
            items: [
                { label: 'Kelola Akun', icon: 'pi pi-fw pi-users', to: '/user', disabled, visible },
                { label: 'Kelola Supplier', icon: 'pi pi-fw pi-truck', to: '/supplier' },
                { label: 'Kelola Pelanggan', icon: 'pi pi-fw pi-user', to: '/customer' }
            ]
        },
        {
            label: 'Aplikasi',
            items: [
                { label: 'Profil Usaha', icon: 'pi pi-fw pi-building', to: '/info', disabled, visible },
                { label: 'Hutang', icon: 'pi pi-fw pi-credit-card', to: '/debt' },
                { label: 'Logout', icon: 'pi pi-fw pi-sign-out', to: '/logout' }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model
                    .filter(({ disabled, visible }) => !disabled && !visible)
                    .map((item, i) => {
                        return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                    })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
