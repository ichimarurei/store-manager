import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import productSchema, { ProductDocument } from '@/models/product.schema';
import { update } from '@/mutations/item/product/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response;

    try {
        await handshakeDB();
        const { _id } = await params;
        const item = await productSchema
            .findOne({ _id })
            .select('-__v')
            .populate({ path: 'category', select: '-__v' })
            .populate({ path: 'unit', select: '-__v' })
            .populate({ path: 'bundle.node.unit', select: '-__v' })
            .populate({ path: 'bundle.contain.unit', select: '-__v' })
            .populate({ path: 'author.created.by', select: '-__v' })
            .populate({ path: 'author.edited.by', select: '-__v' })
            .populate({ path: 'author.deleted.by', select: '-__v' })
            .lean<ProductDocument>();
        response = Response.json(item, { status: !item ? 404 : 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response;

    try {
        await handshakeDB();
        const { _id } = await params;
        const payload = await request.json();
        const saved = await update({ ...payload, _id });
        response = Response.json({ saved: !saved?._id ? false : true }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
