import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import salesSchema, { SalesDocument } from '@/models/sales.schema';
import { create } from '@/mutations/item/inventory/sales/create';
import { NextRequest } from 'next/server';

export const revalidate = 60; // seconds

export async function GET(_: NextRequest) {
    let response: Response;

    try {
        await handshakeDB();
        const items = await salesSchema
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
            .populate({ path: 'customer', select: '-__v' })
            .populate({ path: 'author.created.by', select: '-__v' })
            .populate({ path: 'author.edited.by', select: '-__v' })
            .populate({ path: 'author.deleted.by', select: '-__v' })
            .lean<SalesDocument[]>();
        // Filter out products where product population failed (is null)
        response = Response.json(
            items.map((item) => ({
                ...item,
                products: item.products.filter(({ product }) => product !== null)
            })),
            { status: 200, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=180' } }
        );
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}

export async function POST(request: NextRequest) {
    let response: Response;

    try {
        await handshakeDB();
        const params = await request.json();
        const saved = await create(params);
        response = Response.json({ saved: !!saved?._id }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
