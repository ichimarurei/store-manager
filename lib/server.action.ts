'use server';

import { syncStock } from '@/mutations/item/inventory/stock/sync';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const getUploadedPath = (filename: string, dir = 'global') => {
    const uploadDir = join(process.cwd(), 'public', 'storage', 'image', dir);

    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir);
    }

    return join(uploadDir, filename);
};

export const createErrorResponse = (error?: any): Response => Response.json({ error: error instanceof Error ? error.message : 'Server error', saved: false }, { status: 500 });

export const createDefaultResponse = (error?: string): Response => Response.json({ error: error ?? 'Unprocessable operation!' }, { status: 422 });

export const doSyncStock = async () => {
    let fetched = null;

    try {
        fetched = await syncStock();
    } catch (_) {
        console.error(_);
    }

    return fetched;
};
