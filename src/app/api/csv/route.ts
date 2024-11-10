import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const bodyText = await request.text();
    const file = bodyText ? (JSON.parse(bodyText).file as string) : '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '100', 10);

    try {
        if (file) {
            const lines = file.trim().split('\n');
            if (lines.length === 0)
                return NextResponse.json({
                    headers: [],
                    values: [],
                    total: 0,
                });

            const headers = lines[0].split(',').map((header) => header.trim());

            // Calculate start and end indices for pagination
            const startIndex = (page - 1) * rowsPerPage + 1;
            const endIndex = startIndex + rowsPerPage;

            // Get paginated rows
            const values = lines.slice(startIndex, endIndex).map((line) => {
                const cells = line.split(',').map((value) => value.trim());
                const row: { [key: string]: string } = {};

                headers.forEach((header, index) => {
                    row[header] = cells[index] || ''; // Handle cases where cells may be missing
                });
                return row;
            });

            // Total rows (excluding header row)
            const total = lines.length - 1;

            return NextResponse.json({ headers, values, total });
        }

        return NextResponse.json({ headers: [], values: [], total: 0 });
    } catch (error) {
        console.error('Error parsing CSV file:', error);
        return NextResponse.json(
            { error: 'Error parsing CSV file' },
            { status: 500 }
        );
    }
}
