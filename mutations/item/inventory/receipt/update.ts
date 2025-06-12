import handshakeDB from '@/lib/mongo';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import { buildAuthorPayload } from '@/mutations/global/function';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import { isEmpty } from 'lodash';
import { Types } from 'mongoose';

dayjs.extend(dayjsUTC);

const buildConditionalData = ({ reference, supplier, date }: { reference?: string; supplier?: Types.ObjectId; date?: Date }): Partial<ReceiptDocument> => ({
    ...(date && { date }),
    ...(reference && { reference }),
    supplier: supplier || null
});

const buildUpdateData = async (params: any): Promise<Partial<ReceiptDocument>> => {
    const authorized = await buildAuthorPayload<ReceiptDocument>(params.operator, 'update', params?.author);

    return {
        products: params.products,
        ...buildConditionalData({ reference: params?.reference, supplier: params?.supplier, date: params?.date }),
        ...authorized
    };
};

export const update = async (params: any): Promise<ReceiptDocument | null> => {
    let saved: ReceiptDocument | null = null;

    try {
        if (!isEmpty(params?.products)) {
            await handshakeDB();
            const payload = await buildUpdateData(params);
            saved = await receiptSchema.findOneAndUpdate({ _id: params._id }, payload, { new: true, lean: true }).lean<ReceiptDocument>();
        }
    } catch (_) {}

    return saved;
};
