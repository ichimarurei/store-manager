import handshakeDB from '@/lib/mongo';
import customerSchema, { CustomerDocument } from '@/models/customer.schema';
import { isEmpty } from 'lodash';

const buildUpdateData = (params: any): Partial<CustomerDocument> => ({
    name: params.name,
    phone: params?.phone ?? '',
    address: params?.address ?? '',
    city: params?.city ?? ''
});

export const update = async (params: any): Promise<CustomerDocument | null> => {
    let saved: CustomerDocument | null = null;

    try {
        if (!isEmpty(params?.name) && !isEmpty(params?._id)) {
            await handshakeDB();
            saved = await customerSchema.findOneAndUpdate({ _id: params._id }, buildUpdateData(params), { new: true, lean: true }).lean<CustomerDocument>();
        }
    } catch (_) {
        console.error(_);
    }

    return saved;
};
