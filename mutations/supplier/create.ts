import handshakeDB from '@/lib/mongo';
import supplierSchema, { SupplierDocument } from '@/models/supplier.schema';
import { isEmpty } from 'lodash';

const buildCreateData = (params: any): Partial<SupplierDocument> => ({
    name: params.name,
    phone: params?.phone ?? '',
    address: params?.address ?? ''
});

export const create = async (params: any): Promise<SupplierDocument | null> => {
    let saved: SupplierDocument | null = null;

    try {
        if (!isEmpty(params?.name)) {
            await handshakeDB();
            saved = await supplierSchema.create(buildCreateData(params));
        }
    } catch (_) {
        console.error(_);
    }

    return saved;
};
