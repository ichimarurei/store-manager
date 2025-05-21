import handshakeDB from '@/lib/mongo';
import infoSchema, { InfoDocument } from '@/models/info.schema';
import { isEmpty } from 'lodash';

const isValidParams = (params: any): boolean => !isEmpty(params?._id) && !isEmpty(params?.name);

const buildConditionalData = ({ logo, about, debtConfigFrom }: { logo?: string; about?: any; debtConfigFrom?: any }): Partial<InfoDocument> => ({
    ...(logo && { logo }),
    ...(about && { about }),
    ...(debtConfigFrom && { debtConfigFrom })
});

const buildUpdateData = (params: any): Partial<InfoDocument> => ({
    name: params.name,
    address: params?.address || '',
    ...buildConditionalData({ logo: params?.logo, about: params?.about, debtConfigFrom: params?.debtConfigFrom })
});

export const update = async (params: any): Promise<InfoDocument | null> => {
    let saved: InfoDocument | null = null;

    try {
        if (isValidParams(params)) {
            await handshakeDB();
            saved = await infoSchema.findOneAndUpdate({ _id: params._id }, buildUpdateData(params), { new: true, lean: true }).lean<InfoDocument>();
        }
    } catch (_) {}

    return saved;
};
