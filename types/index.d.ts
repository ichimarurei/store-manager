import mongoose from 'mongoose';
import { Session } from 'next-auth';
import { ReactNode } from 'react';
import { AppMailProps, AppMailReplyProps, AppMailSidebarItem, ChartDataState, ChartOptionsState, CustomEvent, LayoutType, SortOrderType, WebApp } from './app';
import { AppBreadcrumbProps, AppMenuItem, AppMenuItemProps, AppTopbarRef, Breadcrumb, BreadcrumbItem, LayoutConfig, LayoutContextProps, LayoutState, MenuContextProps, MenuModel, MenuProps, NodeRef } from './layout';

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
    ChildContainerProps,
    CustomEvent,
    LayoutConfig,
    LayoutContextProps,
    LayoutState,
    LayoutType,
    MenuContextProps,
    MenuModel,
    MenuProps,
    NodeRef,
    SortOrderType,
    WebApp
};

export interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

export interface IErrorResponse {
    error: string;
}
