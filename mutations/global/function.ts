import handshakeDB from '@/lib/mongo';
import { IAuthor } from '@/models/author';
import { ProductDocument } from '@/models/product.schema';
import userSchema, { UserDocument } from '@/models/user.schema';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import { isEmpty } from 'lodash';
import { Types } from 'mongoose';

dayjs.extend(dayjsUTC);

export const buildAuthorPayload = async (operator: string, mode: 'create' | 'update' | 'delete', authored?: IAuthor): Promise<Partial<ProductDocument> | null> => {
    let by: Types.ObjectId | {} | null = null;

    try {
        await handshakeDB();
        const user = await userSchema.findOne({ username: operator }).select('-__v').lean<UserDocument>();
        by = user?._id || null;
    } catch (_) {}

    return !isEmpty(by)
        ? {
              author: {
                  ...(authored && { ...authored }),
                  ...(mode === 'create' && { created: { by, time: dayjs().utc().toDate() } }),
                  ...(mode === 'update' && { edited: { by, time: dayjs().utc().toDate() } }),
                  ...(mode === 'delete' && { deleted: { by, time: dayjs().utc().toDate() } })
              }
          }
        : null;
};
