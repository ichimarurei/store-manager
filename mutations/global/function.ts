import { IAuthor } from '@/models/author';
import { ProductDocument } from '@/models/product.schema';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import { Types } from 'mongoose';

dayjs.extend(dayjsUTC);

export const buildAuthorPayload = async (operator: string, mode: 'create' | 'update' | 'delete', authored?: IAuthor): Promise<Partial<ProductDocument> | null> => {
    let by: Types.ObjectId | null = null;
    let author = authored || {};

    try {
        const response = await fetch(`/api/user/${operator}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });
        const user = await response.json();
        by = user?._id || null;
    } catch (_) {}

    return by
        ? {
              author: {
                  ...author,
                  ...(mode === 'create' && { created: { by, time: dayjs().utc().toDate() } }),
                  ...(mode === 'update' && { edited: { by, time: dayjs().utc().toDate() } }),
                  ...(mode === 'delete' && { deleted: { by, time: dayjs().utc().toDate() } })
              }
          }
        : null;
};
