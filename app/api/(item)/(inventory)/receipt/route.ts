import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import { create } from '@/mutations/item/inventory/receipt/create';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const items = await receiptSchema
            .find()
            .select('-__v')
            .sort({ date: 'desc', 'author.edited.time': 'desc', 'author.created.time': 'desc' })
            .populate({
                path: 'products.product',
                select: '-__v -author',
                populate: [
                    { path: 'category', select: '-__v' },
                    { path: 'unit', select: '-__v' },
                    { path: 'bundle.node.unit', select: '-__v' },
                    { path: 'bundle.contain.unit', select: '-__v' }
                ]
            })
            .populate({ path: 'products.unit', select: '-__v' })
            .populate({ path: 'author.created.by', select: '-__v' })
            .populate({ path: 'author.edited.by', select: '-__v' })
            .populate({ path: 'author.deleted.by', select: '-__v' })
            .lean<ReceiptDocument[]>();
        response = Response.json(items, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}

export async function POST(request: NextRequest) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const params = await request.json();
        const saved = await create(params);
        response = Response.json({ saved: !saved?._id ? false : true }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
