'use server';

import { MongooseCache } from '@/types';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
let cached: MongooseCache = { conn: null, promise: null };

export default async function handshakeDB(): Promise<typeof mongoose> {
    if (!MONGODB_URI) {
        throw new Error('Please define MONGODB_URI !!!');
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI);
    }

    cached.conn = await cached.promise;

    return cached.conn;
}
