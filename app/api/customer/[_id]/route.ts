'use server';

import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import customerSchema, { CustomerDocument } from '@/models/customer.schema';
import { update } from '@/mutations/customer/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response;

    try {
        await handshakeDB();
        const { _id } = await params;
        const customer = await customerSchema.findOne({ _id }).select('-__v').lean<CustomerDocument>();
        response = Response.json(customer, { status: !customer ? 404 : 200 });
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
        response = Response.json({ saved: !!saved?._id }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
