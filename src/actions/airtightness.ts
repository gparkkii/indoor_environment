const TABLE = {
    1: { min: 8.8, max: 17.7, avg: 14.5 },
    2: { min: 6.6, max: 16.1, avg: 11.5 },
    3: { min: 4.4, max: 11.5, avg: 6.9 },
    4: { min: 2.4, max: 5.8, avg: 3.6 },
    5: { min: 0, max: 0, avg: 0 },
};

interface GetAirtightnessProps {
    year: Year.value;
    airtight: string;
}

interface AirtightnessRes {
    min: number;
    max: number;
    avg: number;
}

export default function getAirtightness({
    year,
    airtight,
}: GetAirtightnessProps): AirtightnessRes | null {
    return TABLE[year];
}
