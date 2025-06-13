import { getDefaultPhoto } from '@/lib/client.action';
import { Privilege } from '@/lib/enum';
import handshakeDB from '@/lib/mongo';
import userSchema, { UserDocument } from '@/models/user.schema';
import { isEmpty } from 'lodash';

const isValidParams = (params: any): boolean => !isEmpty(params?._id) && !isEmpty(params?.name) && !isEmpty(params?.username) && !isEmpty(params?.password);

const buildConditionalData = ({ photo, phone, address, privilege }: { photo?: string; phone?: string; address?: string; privilege?: Privilege }): Partial<UserDocument> => ({
    photo: photo ?? getDefaultPhoto(),
    phone: phone ?? '',
    address: address ?? '',
    ...(privilege && { privilege })
});

const buildUpdateData = (params: any): Partial<UserDocument> => ({
    name: params.name,
    username: params.username,
    password: params.password,
    active: params.active,
    ...buildConditionalData({ photo: params?.photo, phone: params?.phone, address: params?.address, privilege: params?.privilege })
});

export const update = async (params: any): Promise<UserDocument | null> => {
    let saved: UserDocument | null = null;

    try {
        if (isValidParams(params)) {
            await handshakeDB();
            saved = await userSchema.findOneAndUpdate({ _id: params._id }, buildUpdateData(params), { new: true, lean: true }).lean<UserDocument>();
        }
    } catch (_) {
        console.error(_);
    }

    return saved;
};
