'use server';

import handshakeDB from '@/lib/mongo';
import { createErrorResponse } from '@/lib/server.action';
import infoSchema, { InfoDocument } from '@/models/info.schema';
import { update } from '@/mutations/info/update';
import { NextRequest } from 'next/server';

export async function GET(_: NextRequest) {
    let response: Response;

    try {
        await handshakeDB();
        const about = await infoSchema.findOne().select('-__v').lean<InfoDocument>('');
        response = Response.json(about, { status: about?._id ? 200 : 404 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}

export async function POST(request: NextRequest) {
    let response: Response;

    try {
        const params = await request.json();
        const saved = await update(params);
        response = Response.json({ saved: !!saved?._id }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
