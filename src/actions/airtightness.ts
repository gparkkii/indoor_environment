const N_TABLE = {
    1: { avg: 12.6 },
    2: { avg: 8.1 },
    3: { avg: 6.2 },
    4: { avg: 3.6 },
    5: { avg: 1.4 },
};
const L_TABLE = {
    1: { avg: 0 },
    2: { avg: 0 },
    3: { avg: 0 },
    4: { avg: 0.7 },
    5: { avg: 0.5 },
};

interface GetAirtightnessProps {
    year: Year.value;
    atype: ABuildingType.value;
}

interface AirtightnessRes {
    avg: number;
}

export default function getAirtightness({
    year,
    atype,
}: GetAirtightnessProps): AirtightnessRes | null {
    return atype === 1 ? N_TABLE[year] : L_TABLE[year];
}
