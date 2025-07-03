'use server';

const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? '';

export const getData = async (section: string, param: string): Promise<any> => {
    try {
        const response = await fetch(`${baseUrl}/api/${section}/${param}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache', Expires: '0' },
            cache: 'no-store'
        });

        return await response.json();
    } catch (error) {
        console.error(error);

        return null;
    }
};

export const getDataNoParam = async (section: string): Promise<any> => {
    try {
        const response = await fetch(`${baseUrl}/api/${section}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache', Expires: '0' },
            cache: 'no-store'
        });

        return await response.json();
    } catch (error) {
        console.error(error);

        return null;
    }
};

export const getList = async (section: string): Promise<any[]> => {
    try {
        const response = await fetch(`${baseUrl}/api/${section}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache', Expires: '0' },
            cache: 'no-store'
        });

        return await response.json();
    } catch (error) {
        console.error(error);

        return [];
    }
};
