'use server';

const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? '';

export const submitting = async (section: string, payload: any, _id?: string): Promise<boolean> => {
    let saved = false;

    try {
        const response = await fetch(!_id ? `${baseUrl}/api/${section}` : `${baseUrl}/api/${section}/${_id}`, {
            method: !_id ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache', Expires: '0' },
            body: JSON.stringify(payload),
            cache: 'no-store'
        });
        const result = await response.json();
        saved = result?.saved ?? false;
    } catch (error) {
        console.error(error);
    }

    return saved;
};
