import { DataRow } from './@types';

const BASE_URL = '/api/wthr';

export const getWthrDataList = async ({
    startDt,
    endDt,
    startHh,
    endHh,
    stnIds,
    setProcess,
}: {
    startDt: string;
    endDt: string;
    startHh: string;
    endHh: string;
    stnIds?: string;
    setProcess: (value: string) => void;
}): Promise<DataRow[]> => {
    try {
        let allData: DataRow[] = [];
        let pageNo = 1;

        const response = await fetch(
            `${BASE_URL}?startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=${pageNo}`,
            { method: 'GET' }
        );

        if (!response.ok) {
            throw new Error(
                `Error fetching data page 1: ${response.statusText}`
            );
        }

        const result = await response.json();
        allData.push(...result.data);
        if (result.pages > 1) {
            pageNo += 1;
            for (let page = 2; page <= result.pages; page += 1) {
                const currentPage = pageNo * 999;
                setProcess(
                    `<span><strong>${currentPage > result.total ? result.total : currentPage}</strong> of ${result.total}</span><br/>기상청 데이터 불러오는 중...`
                );
                const response = await fetch(
                    `${BASE_URL}?startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=${pageNo}`,
                    { method: 'GET' }
                );

                if (!response.ok) {
                    throw new Error(
                        `Error fetching data page ${page}: ${response.statusText}`
                    );
                } else {
                    const result = await response.json();
                    allData.push(...result.data);

                    console.log(
                        `필요한 날짜 ${startDt} ~ ${endDt}, 총 필요한 데이터 개수 ${result.total}, 필요한 api 호출 수 ${result.pages}, api 호출 횟수 ${pageNo}`
                    );
                    console.log('현재까지 불러온 데이터:', allData);

                    pageNo += 1;
                }
            }
            return allData;
        } else {
            return allData;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Error fetching weather data');
    }
};
