import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import supplierSchema, { SupplierDocument } from '@/models/supplier.schema';
import { create } from '@/mutations/supplier/create';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response;

    try {
        await handshakeDB();
        const suppliers = await supplierSchema.find().select('-__v').sort({ name: 'asc' }).lean<SupplierDocument[]>();
        response = Response.json(suppliers, { status: 200 });
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
