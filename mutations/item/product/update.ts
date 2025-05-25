import handshakeDB from '@/lib/mongo';
import { IBundling } from '@/models/bundling';
import productSchema, { ProductDocument } from '@/models/product.schema';
import { buildAuthorPayload } from '@/mutations/global/function';
import { isEmpty } from 'lodash';

const isValidParams = (params: any): boolean => !isEmpty(params?.name) && !isEmpty(params?.category) && !isEmpty(params?.unit) && !isEmpty(params?.cost) && !isEmpty(params?.operator) && !isEmpty(params?.author);

const buildConditionalData = ({ discount, bundle, images }: { discount?: number; bundle?: IBundling; images?: string[] }): Partial<ProductDocument> => ({
    ...(discount && { discount }),
    ...(bundle && { bundle }),
    ...(images && { images })
});

const buildUpdateData = async (params: any): Promise<Partial<ProductDocument>> => {
    const authorized = await buildAuthorPayload(params.operator, 'update', params?.author);

    return {
        name: params.name,
        category: params.category,
        unit: params.unit,
        cost: params.cost,
        ...buildConditionalData({ discount: params?.discount, bundle: params?.bundle, images: params?.images }),
        ...authorized
    };
};

export const update = async (params: any): Promise<ProductDocument | null> => {
    let saved: ProductDocument | null = null;

    try {
        if (isValidParams(params)) {
            await handshakeDB();
            saved = await productSchema.findOneAndUpdate({ _id: params._id }, buildUpdateData(params), { new: true, lean: true }).lean<ProductDocument>();
        }
    } catch (_) {}

    return saved;
};
