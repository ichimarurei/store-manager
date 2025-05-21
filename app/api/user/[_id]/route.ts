import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import userSchema, { UserDocument } from '@/models/user.schema';
import { update } from '@/mutations/user/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const { _id } = await params;
        const user = await userSchema.findOne({ _id }).select('-__v').lean<UserDocument>();
        response = Response.json(user, { status: !user ? 404 : 200 });
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
