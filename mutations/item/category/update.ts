import handshakeDB from '@/lib/mongo';
import categorySchema, { CategoryDocument } from '@/models/category.schema';
import { isEmpty } from 'lodash';

export const update = async (params: any): Promise<CategoryDocument | null> => {
    let saved: CategoryDocument | null = null;

    try {
        if (!isEmpty(params?.name) && !isEmpty(params?._id)) {
            await handshakeDB();
            saved = await categorySchema.findOneAndUpdate({ _id: params._id }, { name: params.name }, { new: true, lean: true }).lean<CategoryDocument>();
        }
    } catch (_) {}

    return saved;
};
