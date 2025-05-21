import { Privilege } from '@/lib/enum';
import handshakeDB from '@/lib/mongo';
import userSchema, { UserDocument } from '@/models/user.schema';
import { isEmpty } from 'lodash';

const isValidParams = (params: any): boolean => !isEmpty(params?.name) && !isEmpty(params?.username) && !isEmpty(params?.password);

const buildConditionalData = ({ photo, phone, address, privilege }: { photo?: string; phone?: string; address?: string; privilege?: Privilege }): Partial<UserDocument> => ({
    ...(photo && { photo }),
    ...(phone && { phone }),
    ...(address && { address }),
    ...(privilege && { privilege })
});

const buildCreateData = (params: any): Partial<UserDocument> => ({
    name: params.name,
    username: params.username,
    password: params.password,
    active: params.active,
    ...buildConditionalData({ photo: params?.photo, phone: params?.phone, address: params?.address, privilege: params?.privilege })
});

export const create = async (params: any): Promise<UserDocument | null> => {
    let saved: UserDocument | null = null;

    try {
        if (isValidParams(params)) {
            await handshakeDB();
            saved = await userSchema.create(buildCreateData(params));
        }
    } catch (_) {}

    return saved;
};
