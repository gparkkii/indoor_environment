import { DataRow } from './@types';

const BASE_URL =
    'http://apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList';
const API_KEY =
    'v8Nzm%2B%2BPMhW7zOOBSJc%2B5ohWzRZoYJFvprIGa4wandlVTN6PYWJrMXsFH49eXU14jUowf8fuFvbVoirYPRNxDw%3D%3D';

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
    stnIds: string;
}): Promise<DataRow[]> => {
    let allData: DataRow[] = [];
    let pageNo = 1;
    const numOfRows = 999; // 최대 값 설정
    let totalCount = 0;

    try {
        // 첫 번째 요청으로 totalCount 값을 가져옴
        const firstResponse = await fetch(
            `${BASE_URL}?serviceKey=${API_KEY}&dataType=JSON&dataCd=ASOS&dateCd=HR&startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=1&numOfRows=${numOfRows}`,
            { method: 'GET' }
        );
        const firstResult = await firstResponse.json();

        if (firstResult.response.header.resultCode !== '00') {
            throw new Error(
                `API Error: ${firstResult.response.header.resultMsg}`
            );
        }

        totalCount = firstResult.response.body.totalCount;
        allData = [
            ...firstResult.response.body.items.item.map((item: any) => ({
                stnId: Number(item.stnId), // stnId는 관측소 코드
                tm: item.tm, // tm은 일시
                temp: Number(item.ta), // 온도는 ta
                humi: Number(item.hm), // 상대습도는 hm
            })),
        ];

        // 페이지네이션 처리
        const totalPages = Math.ceil(totalCount / numOfRows); // 총 페이지 수 계산
        for (pageNo = 2; pageNo <= totalPages; pageNo++) {
            const response = await fetch(
                `${BASE_URL}?serviceKey=${API_KEY}&dataType=JSON&dataCd=ASOS&dateCd=HR&startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=${pageNo}&numOfRows=${numOfRows}`,
                { method: 'GET' }
            );
            const result = await response.json();

            if (result.response.header.resultCode !== '00') {
                throw new Error(
                    `API Error on page ${pageNo}: ${result.response.header.resultMsg}`
                );
            }

            const pageData = result.response.body.items.item.map(
                (item: any) => ({
                    stnId: Number(item.stnId),
                    tm: item.tm,
                    temp: Number(item.ta),
                    humi: Number(item.hm),
                })
            );

            allData = [...allData, ...pageData]; // 데이터를 계속 추가
        }

        return allData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Error fetching weather data');
    }
};
