import handshakeDB from '@/lib/mongo';
import supplierSchema, { SupplierDocument } from '@/models/supplier.schema';
import { isEmpty } from 'lodash';

const buildUpdateData = (params: any): Partial<SupplierDocument> => ({
    name: params.name,
    phone: params?.phone || '',
    address: params?.address || ''
});

export const update = async (params: any): Promise<SupplierDocument | null> => {
    let saved: SupplierDocument | null = null;

    try {
        if (!isEmpty(params?.name) && !isEmpty(params?._id)) {
            await handshakeDB();
            saved = await supplierSchema.findOneAndUpdate({ _id: params._id }, buildUpdateData(params), { new: true, lean: true }).lean<SupplierDocument>();
        }
    } catch (_) {}

    return saved;
};
