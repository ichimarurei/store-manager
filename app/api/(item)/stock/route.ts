import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import productSchema, { ProductDocument } from '@/models/product.schema';
import receiptSchema from '@/models/receipt.schema';
import salesSchema from '@/models/sales.schema';
import { reverse, sortBy } from 'lodash';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const stocks: any[] = [];
        const incoming = await receiptSchema.aggregate([{ $unwind: '$products' }, { $group: { _id: '$products.product', incoming: { $sum: '$products.qty' } } }]);
        const outgoing = await salesSchema.aggregate([{ $unwind: '$products' }, { $group: { _id: '$products.product', outgoing: { $sum: '$products.salesQty.qty' } } }]);
        const items = await productSchema
            .find()
            .select('-__v')
            .sort({ name: 'asc', 'author.edited.time': 'desc', 'author.created.time': 'desc' })
            .populate({ path: 'category', select: '-__v' })
            .populate({ path: 'unit', select: '-__v' })
            .populate({ path: 'bundle.node.unit', select: '-__v' })
            .populate({ path: 'bundle.contain.unit', select: '-__v' })
            .populate({ path: 'author.created.by', select: '-__v' })
            .populate({ path: 'author.edited.by', select: '-__v' })
            .populate({ path: 'author.deleted.by', select: '-__v' })
            .lean<ProductDocument[]>();

        // Create a map for outgoing stock for easy lookup
        const outgoingMap = outgoing.reduce((item, { _id, outgoing }) => {
            item[_id] = outgoing;

            return item;
        }, {});

        // Calculate actual stock for each product
        const actualStock = incoming.map(({ _id, incoming }) => {
            const outQty = outgoingMap[_id] || 0; // // Get outgoing qty or 0 if not found

            return { _id, qty: incoming - outQty };
        });

        items.forEach((item) => {
            const stock = actualStock.find(({ _id }) => String(_id) === String(item._id));
            stocks.push({ ...item, stock: stock?.qty || 0 });
        });

        response = Response.json(reverse(sortBy(stocks, 'stock')), { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
