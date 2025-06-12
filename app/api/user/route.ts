import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import userSchema, { UserDocument } from '@/models/user.schema';
import { create } from '@/mutations/user/create';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response;

    try {
        await handshakeDB();
        const users = await userSchema.find().select('-__v').sort({ active: 'descending', privilege: 'asc', username: 'asc' }).lean<UserDocument[]>();
        response = Response.json(users, { status: 200 });
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
        response = Response.json({ saved: !saved?._id ? false : true }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
