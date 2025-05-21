import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import unitSchema, { UnitDocument } from '@/models/unit.schema';
import { update } from '@/mutations/item/unit/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const { _id } = await params;
        const unit = await unitSchema.findOne({ _id }).select('-__v').lean<UnitDocument>();
        response = Response.json(unit, { status: !unit ? 404 : 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response = createDefaultResponse();

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
