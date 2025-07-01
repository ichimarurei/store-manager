import handshakeDB from '@/lib/mongo';
import salesSchema, { SalesDocument } from '@/models/sales.schema';
import { buildAuthorPayload } from '@/mutations/global/function';
import { syncStockByIds } from '@/mutations/item/inventory/stock/sync';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import { isEmpty } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

dayjs.extend(dayjsUTC);

const buildConditionalData = ({ reference, customer, date, change, tax }: { reference?: string; customer?: Types.ObjectId; date?: Date; change?: number; tax?: number }): Partial<SalesDocument> => ({
    date: date ?? dayjs().utc().toDate(),
    reference: !isEmpty(reference) ? reference : uuid().replaceAll('-', '').toUpperCase(),
    customer: customer ?? null,
    change: change ?? 0,
    tax: tax ?? 0
});

const buildCreateData = async (params: any): Promise<Partial<SalesDocument>> => {
    const authorized = await buildAuthorPayload<SalesDocument>(params.operator, 'create');

    return {
        products: params.products,
        subPrice: params.subPrice,
        finalPrice: params.finalPrice,
        paid: params.paid,
        ...buildConditionalData({ reference: params?.reference, customer: params?.customer, date: params?.date, change: params?.change, tax: params?.tax }),
        ...authorized
    };
};

export const create = async (params: any): Promise<SalesDocument | null> => {
    let saved: SalesDocument | null = null;

    try {
        if (!isEmpty(params?.products)) {
            await handshakeDB();
            const payload = await buildCreateData(params);
            saved = await salesSchema.create(payload);

            if (saved) {
                await syncStockByIds(params.products.map(({ product }: any) => String(product)));
            }
        }
    } catch (_) {
        console.error(_);
    }

    return saved;
};
