import handshakeDB from '@/lib/mongo';
import unitSchema, { UnitDocument } from '@/models/unit.schema';
import { isEmpty } from 'lodash';

export const update = async (params: any): Promise<UnitDocument | null> => {
    let saved: UnitDocument | null = null;

    try {
        if (!isEmpty(params?.name) && !isEmpty(params?._id)) {
            await handshakeDB();
            saved = await unitSchema.findOneAndUpdate({ _id: params._id }, { name: params.name, short: params?.short || '' }, { new: true, lean: true }).lean<UnitDocument>();
        }
    } catch (_) {}

    return saved;
};
