import handshakeDB from '@/lib/mongo';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import { buildAuthorPayload } from '@/mutations/global/function';
import { syncStockByIds } from '@/mutations/item/inventory/stock/sync';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import { isEmpty } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

dayjs.extend(dayjsUTC);

const buildConditionalData = ({ reference, supplier, date }: { reference?: string; supplier?: Types.ObjectId; date?: Date }): Partial<ReceiptDocument> => ({
    date: date ?? dayjs().utc().toDate(),
    reference: !isEmpty(reference) ? reference : uuid().replaceAll('-', '').toUpperCase(),
    supplier: supplier ?? null
});

const buildCreateData = async (params: any): Promise<Partial<ReceiptDocument>> => {
    const authorized = await buildAuthorPayload<ReceiptDocument>(params.operator, 'create');

    return {
        products: params.products,
        ...buildConditionalData({ reference: params?.reference, supplier: params?.supplier, date: params?.date }),
        ...authorized
    };
};

export const create = async (params: any): Promise<ReceiptDocument | null> => {
    let saved: ReceiptDocument | null = null;

    try {
        if (!isEmpty(params?.products)) {
            await handshakeDB();
            const payload = await buildCreateData(params);
            saved = await receiptSchema.create(payload);
        }
    } catch (_) {
        console.error(_);
    }

    if (saved) {
        await syncStockByIds(params.products.map(({ product }: any) => String(product)));
    }

    return saved;
};
