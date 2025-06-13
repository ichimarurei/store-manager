import { createErrorResponse, getUploadedPath } from '@/lib/server.action';
import { v2 as cloudinary } from 'cloudinary';
import { createWriteStream } from 'fs';
import { NextRequest } from 'next/server';
import { basename, extname } from 'path';

const config = {
    userId: process.env.CLOUD_STORAGE_APP_USER || '',
    clientId: process.env.CLOUD_STORAGE_APP_CLIENT || '',
    clientSecret: process.env.CLOUD_STORAGE_APP_SECRET || '',
    useCloud: (process.env.CLOUD_STORAGE_APP_ACTIVE || '') === 'true'
};

const uploadToCloud = async (file: File): Promise<string | null> => {
    let uploaded = null;
    cloudinary.config({ cloud_name: config.userId, api_key: config.clientId, api_secret: config.clientSecret });

    try {
        const byteArrayBuffer = Buffer.from(await file.arrayBuffer());
        const uploading: any = await new Promise((resolve) => cloudinary.uploader.upload_stream({ overwrite: true, public_id: basename(file.name, extname(file.name)) }, (_, result) => resolve(result)).end(byteArrayBuffer));
        uploaded = uploading?.secure_url;
    } catch (_) {
        console.error(_);
    }

    return uploaded;
};

const uploadToLocal = async (file: File, dir?: string): Promise<string | null> => {
    let uploaded = null;

    try {
        const path = getUploadedPath(file.name, dir || 'global');
        const paths = path.split('/public/');
        const fileStream = createWriteStream(path);
        fileStream.write(Buffer.from(await file.arrayBuffer()));
        fileStream.end();
        uploaded = `/${paths[1]}`;
    } catch (_) {
        console.error(_);
    }

    return uploaded;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ dir?: string[] }> }) {
    let response: Response;

    try {
        const { dir } = await params;
        const formData = await request.formData();
        const listFiles = Array.from(formData.values());
        const uploaded: string[] = [];

        for (const files of listFiles) {
            if (files instanceof File) {
                const saved = config.useCloud ? await uploadToCloud(files) : await uploadToLocal(files, dir?.at(0));

                if (saved) {
                    uploaded.push(saved);
                }
            }
        }

        response = Response.json({ uploaded }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
