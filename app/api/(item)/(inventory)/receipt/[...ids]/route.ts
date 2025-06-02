import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import { update } from '@/mutations/item/inventory/receipt/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ ids: string[] }> }) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const { ids } = await params;
        const item = await receiptSchema
            .findOne(ids.length === 1 ? { _id: ids[0] } : { _id: ids[0], 'products.product._id': ids[1] })
            .select('-__v')
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
            .lean<ReceiptDocument>();
        response = Response.json(item, { status: !item ? 404 : 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ ids: string[] }> }) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const { ids } = await params;
        const payload = await request.json();
        const saved = await update({ ...payload, ...(ids.length === 1 ? { _id: ids[0] } : { _id: ids[0], 'products.product._id': ids[1] }) });
        response = Response.json({ saved: !saved?._id ? false : true }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
