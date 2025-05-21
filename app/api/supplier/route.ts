import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import supplierSchema, { SupplierDocument } from '@/models/supplier.schema';
import { create } from '@/mutations/supplier/create';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response = createDefaultResponse();

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
