import handshakeDB from '@/lib/mongo';
import userSchema, { UserDocument } from '@/models/user.schema';
import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    let response: Response = Response.json({ error: 'Unprocessable operation!' }, { status: 422 });
    let signed = false;

    try {
        await handshakeDB();
        const { username, password } = await req.json();
        const exist = await userSchema.findOne({ username, active: true }).lean<UserDocument>();
        signed = exist?.password === createHash('md5').update(password).digest('hex');
        response = Response.json(signed && exist?._id ? exist : { error: 'Akun tidak ditemukan' }, { status: signed ? 200 : 404 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Server error';
        response = Response.json({ error: message }, { status: 500 });
    }

    return response;
}
