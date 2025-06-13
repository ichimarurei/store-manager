import { getAppInfo } from '@/lib/client.action';
import { useStateStore } from '@/state/store';
import { AppTopbarRef } from '@/types';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppTopbar = forwardRef<AppTopbarRef>((_, ref) => {
    const { layoutState, onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const { env: envValues, setAppInfo } = useStateStore();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current
    }));

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
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={envValues.application.logo} width="47.22px" height={'35px'} alt="logo" />
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button" ref={menubuttonRef} onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
                <button type="button" className="p-link layout-topbar-button" onClick={async () => await signOut()}>
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
