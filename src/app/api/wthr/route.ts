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
    const pageNo = searchParams.get('pageNo') || 1;

    const numOfRows = 999;

    try {
        const firstResponse = await fetch(
            `${BASE_URL}?serviceKey=${API_KEY}&dataType=JSON&dataCd=ASOS&dateCd=HR&startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}&pageNo=${pageNo}&numOfRows=${numOfRows}`,
            { method: 'GET' }
        );
        const result = await firstResponse.json();

        if (result.response.header.resultCode !== '00') {
            return NextResponse.json(
                { error: result.response.header.resultMsg },
                { status: 500 }
            );
        }

        const totalCount = result.response.body.totalCount;
        const pageData = result.response.body.items.item.map((item: any) => ({
            stnId: Number(item.stnId),
            tm: item.tm,
            temp: Number(item.ta),
            humi: Number(item.hm),
        }));
        const totalPages = Math.ceil(totalCount / numOfRows);

        return NextResponse.json({
            data: pageData,
            total: totalCount,
            pages: totalPages,
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return NextResponse.json(
            { error: 'Error fetching weather data' },
            { status: 500 }
        );
    }
}
