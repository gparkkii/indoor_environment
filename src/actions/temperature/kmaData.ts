import { DataRow } from './@types';

const BASE_URL = '/api/wthr';

export const getWthrDataList = async ({
    startDt,
    endDt,
    startHh,
    endHh,
    stnIds,
}: {
    startDt: string;
    endDt: string;
    startHh: string;
    endHh: string;
    stnIds?: string;
}): Promise<DataRow[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}?startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data: DataRow[] = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Error fetching weather data');
    }
};
