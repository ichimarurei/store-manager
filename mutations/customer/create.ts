import handshakeDB from '@/lib/mongo';
import customerSchema, { CustomerDocument } from '@/models/customer.schema';
import { isEmpty } from 'lodash';

const buildCreateData = (params: any): Partial<CustomerDocument> => ({
    name: params.name,
    phone: params?.phone || '',
    address: params?.address || '',
    city: params?.city || ''
});

export const create = async (params: any): Promise<CustomerDocument | null> => {
    let saved: CustomerDocument | null = null;

    try {
        if (!isEmpty(params?.name)) {
            await handshakeDB();
            saved = await customerSchema.create(buildCreateData(params));
        }
    } catch (_) {}

    return saved;
};
