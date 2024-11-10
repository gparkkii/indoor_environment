'use server';

export async function getPreview({
    page,
    rowsPerPage,
    file,
}: {
    page: number;
    rowsPerPage: number;
    file: string;
}): Promise<{
    headers: string[];
    values: {
        [key: string]: string;
    }[];
    total: number;
} | null> {
    try {
        const response = await fetch(
            `/api/csv?page=${page}&rowsPerPage=${rowsPerPage}`,
            {
                method: 'POST',
                body: JSON.stringify(file),
            }
        );

        const data = await response.json();

        console.log({ data });
        return data;
    } catch (e) {
        console.error(e);
    }
    return null;
}
