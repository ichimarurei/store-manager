import handshakeDB from '@/lib/mongo';
import unitSchema, { UnitDocument } from '@/models/unit.schema';
import { isEmpty } from 'lodash';

export const create = async (params: any): Promise<UnitDocument | null> => {
    let saved: UnitDocument | null = null;

    try {
        if (!isEmpty(params?.name)) {
            await handshakeDB();
            saved = await unitSchema.create({ name: params.name, short: params?.short || '' });
        }
    } catch (_) {}

    return saved;
};
