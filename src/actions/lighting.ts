/**
 * TABLE
 * {준공연도 : {건물 용도 : {최소, 평균, 최대}}}
 */
const TABLE: Record<
    Year.value,
    Record<BuildingType.value, { min: number; max: number; avg: number }>
> = {
    1: {
        1: { min: 2.0, max: 4.1, avg: 3.4 },
        2: { min: 2.4, max: 7.4, avg: 5.4 },
        3: { min: 2.4, max: 5.9, avg: 4.7 },
    },
    2: {
        1: { min: 2.1, max: 4.2, avg: 3.4 },
        2: { min: 2.4, max: 6.3, avg: 4.8 },
        3: { min: 2.8, max: 6.3, avg: 4.9 },
    },
    3: {
        1: { min: 1.9, max: 3.9, avg: 3.3 },
        2: { min: 2.5, max: 6.0, avg: 4.8 },
        3: { min: 3.0, max: 7.0, avg: 5.4 },
    },
    4: {
        1: { min: 2.0, max: 4.2, avg: 3.4 },
        2: { min: 2.9, max: 6.3, avg: 5.1 },
        3: { min: 3.1, max: 7.2, avg: 5.7 },
    },
    5: {
        1: { min: 0, max: 0, avg: 0 },
        2: { min: 0, max: 0, avg: 0 },
        3: { min: 0, max: 0, avg: 0 },
    },
};

interface GetLightingProps {
    buildingType: BuildingType.value;
    year: Year.value;
}

interface LightingRes {
    min: number;
    max: number;
    avg: number;
}

export default function getLighting({
    year,
    buildingType,
}: GetLightingProps): LightingRes | null {
    return TABLE[year][buildingType];
}
