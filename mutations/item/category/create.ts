import handshakeDB from '@/lib/mongo';
import categorySchema, { CategoryDocument } from '@/models/category.schema';
import { isEmpty } from 'lodash';

export const create = async (params: any): Promise<CategoryDocument | null> => {
    let saved: CategoryDocument | null = null;

    try {
        if (!isEmpty(params?.name)) {
            await handshakeDB();
            saved = await categorySchema.create({ name: params.name });
        }
    } catch (_) {}

    return saved;
};
