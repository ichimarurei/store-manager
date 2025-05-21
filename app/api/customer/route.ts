import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import customerSchema, { CustomerDocument } from '@/models/customer.schema';
import { create } from '@/mutations/customer/create';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const customers = await customerSchema.find().select('-__v').sort({ name: 'asc', city: 'asc' }).lean<CustomerDocument[]>();
        response = Response.json(customers, { status: 200 });
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
