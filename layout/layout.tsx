'use client';

import { AppTopbarRef, ChildContainerProps, LayoutState } from '@/types';
import { Analytics } from '@vercel/analytics/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEventListener, useUnmountEffect } from 'primereact/hooks';
import { classNames } from 'primereact/utils';
import React, { useContext, useEffect, useRef } from 'react';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { LayoutContext } from './context/layoutcontext';

const Layout = ({ children }: ChildContainerProps) => {
    const { layoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const topbarRef = useRef<AppTopbarRef>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const isClickInsideElement = (element: Node | undefined | null, target: Node): boolean => !!element && (element.isSameNode(target) || element.contains(target));

    const isOutsideClicked = (event: MouseEvent): boolean => {
        const target = event.target as Node;

        return !(isClickInsideElement(sidebarRef.current, target) || isClickInsideElement(topbarRef.current?.menubutton, target));
    };

    const isTopbarOutsideClicked = (event: Event): boolean =>
        !(
            topbarRef.current?.topbarmenu?.isSameNode(event.target as Node) ||
            topbarRef.current?.topbarmenu?.contains(event.target as Node) ||
            topbarRef.current?.topbarmenubutton?.isSameNode(event.target as Node) ||
            topbarRef.current?.topbarmenubutton?.contains(event.target as Node)
        );

    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event: MouseEvent) => {
            if (isOutsideClicked(event)) {
                hideMenu();
            }
        }
    });

    const [bindProfileMenuOutsideClickListener, unbindProfileMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            if (isTopbarOutsideClicked(event)) {
                hideProfileMenu();
            }
        }
    });

    const hideMenu = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        unbindMenuOutsideClickListener();
        unblockBodyScroll();
    };

    const hideProfileMenu = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            profileSidebarVisible: false
        }));
        unbindProfileMenuOutsideClickListener();
    };

    const blockBodyScroll = (): void => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = (): void => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };

    useEffect(() => {
        hideMenu();
        hideProfileMenu();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
            bindMenuOutsideClickListener();
        }

        layoutState.staticMenuMobileActive && blockBodyScroll();
    }, [bindMenuOutsideClickListener, layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

    useEffect(() => {
        if (layoutState.profileSidebarVisible) {
            bindProfileMenuOutsideClickListener();
        }
    }, [bindProfileMenuOutsideClickListener, layoutState.profileSidebarVisible]);

    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
        unbindProfileMenuOutsideClickListener();
    });

    const containerClass = classNames('layout-wrapper', {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'p-input-filled': layoutConfig.inputStyle === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple
    });

    return (
        <React.Fragment>
            <div className={containerClass}>
                <AppTopbar ref={topbarRef} />
                <div ref={sidebarRef} className="layout-sidebar">
                    <AppSidebar />
                </div>
                <div className="layout-main-container">
                    <div className="layout-main">{children}</div>
                    <AppFooter />
                </div>
                <div className="layout-mask"></div>
            </div>
            <Analytics />
        </React.Fragment>
    );
};

export default Layout;
