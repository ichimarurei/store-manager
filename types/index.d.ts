import mongoose from 'mongoose';
import { Session } from 'next-auth';
import { ReactNode } from 'react';
import { AppMailProps, AppMailReplyProps, AppMailSidebarItem, ChartDataState, ChartOptionsState, CustomEvent, Demo, LayoutType, SortOrderType } from './app';
import {
    AppBreadcrumbProps,
    AppMenuItem,
    AppMenuItemProps,
    AppTopbarRef,
    Breadcrumb,
    BreadcrumbItem,
    ChatContextProps,
    LayoutConfig,
    LayoutContextProps,
    LayoutState,
    MailContextProps,
    MenuContextProps,
    MenuModel,
    MenuProps,
    NodeRef,
    Page,
    TaskContextProps
} from './layout';

type ChildContainerProps = {
    children: ReactNode;
    session?: Session;
};

export type {
    AppBreadcrumbProps,
    AppMailProps,
    AppMailReplyProps,
    AppMailSidebarItem,
    AppMenuItem,
    AppMenuItemProps,
    AppTopbarRef,
    Breadcrumb,
    Breadcrumb,
    BreadcrumbItem,
    ChartDataState,
    ChartOptionsState,
    ChatContextProps,
    ChildContainerProps,
    CustomEvent,
    Demo,
    LayoutConfig,
    LayoutContextProps,
    LayoutState,
    LayoutType,
    MailContextProps,
    MenuContextProps,
    MenuModel,
    MenuProps,
    NodeRef,
    Page,
    SortOrderType,
    TaskContextProps
};

export interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

export interface IErrorResponse {
    error: string;
}
