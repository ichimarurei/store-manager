import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import supplierSchema, { SupplierDocument } from '@/models/supplier.schema';
import { update } from '@/mutations/supplier/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response;

    try {
        await handshakeDB();
        const { _id } = await params;
        const supplier = await supplierSchema.findOne({ _id }).select('-__v').lean<SupplierDocument>();
        response = Response.json(supplier, { status: !supplier ? 404 : 200 });
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
