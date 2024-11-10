import { NextResponse } from 'next/server';

const BASE_URL =
    'http://apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList';
const API_KEY =
    'v8Nzm%2B%2BPMhW7zOOBSJc%2B5ohWzRZoYJFvprIGa4wandlVTN6PYWJrMXsFH49eXU14jUowf8fuFvbVoirYPRNxDw%3D%3D';

interface DataRow {
    stnId: number;
    tm: string;
    temp: number;
    humi: number;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const startDt = searchParams.get('startDt') || '';
    const endDt = searchParams.get('endDt') || '';
    const startHh = searchParams.get('startHh') || '';
    const endHh = searchParams.get('endHh') || '';
    const stnIds = searchParams.get('stnIds') || '';

    let allData: DataRow[] = [];
    let pageNo = 1;
    const numOfRows = 999;
    let totalCount = 0;

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const firstResponse = await fetch(
                    `${BASE_URL}?serviceKey=${API_KEY}&dataType=JSON&dataCd=ASOS&dateCd=HR&startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=1&numOfRows=${numOfRows}`,
                    { method: 'GET' }
                );
                const firstResult = await firstResponse.json();

                if (firstResult.response.header.resultCode !== '00') {
                    controller.enqueue(
                        JSON.stringify({
                            error: firstResult.response.header.resultMsg,
                        }) + '\n'
                    );
                    controller.close();
                    return;
                }

                totalCount = firstResult.response.body.totalCount;
                const totalPages = Math.ceil(totalCount / numOfRows);

                allData = firstResult.response.body.items.item.map(
                    (item: any) => ({
                        stnId: Number(item.stnId),
                        tm: item.tm,
                        temp: Number(item.ta),
                        humi: Number(item.hm),
                    })
                );
                controller.enqueue(
                    JSON.stringify({ progress: 1, totalPages }) + '\n'
                );

                for (pageNo = 2; pageNo <= totalPages; pageNo++) {
                    const response = await fetch(
                        `${BASE_URL}?serviceKey=${API_KEY}&dataType=JSON&dataCd=ASOS&dateCd=HR&startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=${pageNo}&numOfRows=${numOfRows}`,
                        { method: 'GET' }
                    );
                    const result = await response.json();

                    if (result.response.header.resultCode !== '00') {
                        controller.enqueue(
                            JSON.stringify({
                                error: `API Error on page ${pageNo}: ${result.response.header.resultMsg}`,
                            }) + '\n'
                        );
                        controller.close();
                        return;
                    }

                    const pageData = result.response.body.items.item.map(
                        (item: any) => ({
                            stnId: Number(item.stnId),
                            tm: item.tm,
                            temp: Number(item.ta),
                            humi: Number(item.hm),
                        })
                    );

                    allData = [...allData, ...pageData];
                    controller.enqueue(
                        JSON.stringify({ progress: pageNo, totalPages }) + '\n'
                    );
                }

                controller.enqueue(JSON.stringify({ allData }) + '\n');
                controller.close();
            } catch (error) {
                controller.enqueue(
                    JSON.stringify({ error: 'Error fetching weather data' }) +
                        '\n'
                );
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'application/json' },
    });
}
