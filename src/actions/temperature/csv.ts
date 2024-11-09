import { DataRow, MProcessedDataRow, WProcessedDataRow } from './@types';
import { calculateHumi } from './calculateHumi';
import { calculateVaporPressure } from './calculatePSaturated';
import { calculateTemp } from './calculateTemp';
import { getWthrDataList } from './kmaData';
import { calculate24HourMovingAverage } from './resampleData';
// CSV를 파싱하는 함수
const parseCSV = (csv: string): DataRow[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map((header) => header.trim());

    const stnId = headers.findIndex(
        (header) => header.toLocaleLowerCase() === 'stnid'
    );
    const tm = headers.findIndex(
        (header) => header.toLocaleLowerCase() === 'tm'
    );
    const temp = headers.findIndex(
        (header) => header.toLocaleLowerCase() === 'temp'
    );
    const humi = headers.findIndex(
        (header) => header.toLocaleLowerCase() === 'humi'
    );

    return lines.slice(1).map((line) => {
        const values = line.split(',').map((value) => value.trim());
        const row: DataRow = {
            stnId: Number(values?.[stnId]),
            tm: values?.[tm],
            temp: Number(values?.[temp]),
            humi: Number(values?.[humi]),
        };
        return row;
    });
};

const handleFileUpload = (file: File): Promise<DataRow[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target?.result as string;
            const parsedData = parseCSV(text);
            resolve(parsedData);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsText(file);
    });
};

// 데이터를 시간 기준으로 결합하는 함수
const mergeDataByTime = (
    measuredData: any[],
    weatherData: any[]
): {
    tm: Date;
    mTemp: number;
    mHumi: number;
    wTemp: number;
    wHumi: number;
}[] => {
    const mergedData: {
        tm: Date;
        mTemp: number;
        mHumi: number;
        wTemp: number;
        wHumi: number;
    }[] = [];

    measuredData.forEach((mEntry) => {
        const matchingWEntry = weatherData.find(
            (wEntry) =>
                new Date(mEntry.tm).getTime() === new Date(wEntry.tm).getTime()
        );
        if (matchingWEntry) {
            mergedData.push({
                tm: mEntry.tm,
                mTemp: mEntry.mTemp,
                mHumi: mEntry.mHumi,
                wTemp: matchingWEntry.temp,
                wHumi: matchingWEntry.humi,
            });
        }
    });

    return mergedData;
};

const padStringFormat = (value: number) => {
    return value.toString().padStart(2, '0');
};

export const processFile = async (
    file: File,
    setProcess: React.Dispatch<React.SetStateAction<string>>
) => {
    try {
        const parsedData = await handleFileUpload(file);

        console.log('측정 데이터 이동평균 구하는 중...');
        setProcess('측정 데이터 이동평균 구하는 중...');
        const { result: mResult, data: resampledData } =
            await calculate24HourMovingAverage(parsedData, 'm');
        console.log('측정 데이터 이동평균 :', { resampledData });

        if (mResult === 'success') {
            const stnIds = resampledData[0].userStnId.toString(); // stnIds
            const firstDate = resampledData[0].tm; // 최초 일자
            const lastDate = resampledData[resampledData.length - 1].tm; // 마지막 일자

            const startDt =
                `${firstDate.getFullYear()}` +
                `${padStringFormat(firstDate.getMonth() + 1)}` +
                `${padStringFormat(firstDate.getDate())}`;
            const startHh = `${padStringFormat(firstDate.getHours())}`;

            const endDt =
                `${lastDate.getFullYear()}` +
                `${padStringFormat(lastDate.getMonth() + 1)}` +
                `${padStringFormat(lastDate.getDate())}`;
            const endHh = `${padStringFormat(lastDate.getHours())}`;

            console.log('기상청 데이터 불러오는 중...');
            setProcess('기상청 데이터 불러오는 중...');
            const wthrData = await getWthrDataList({
                startDt,
                startHh,
                endDt,
                endHh,
                stnIds,
            });
            console.log('기상청 데이터 :', { wthrData });

            console.log('기상청 데이터 이동평균 구하는 중...');
            setProcess('기상청 데이터 이동평균 구하는 중...');
            const { result: wResult, data: resampledWthrData } =
                await calculate24HourMovingAverage(wthrData, 'w');
            console.log('기상청 데이터 이동평균 :', wResult, resampledWthrData);

            console.log('측정 데이터 + 기상청 데이터 결합중..');
            setProcess('측정 데이터 + 기상청 데이터 결합중..');
            if (wResult === 'success') {
                const mergedData = mergeDataByTime(
                    resampledData,
                    resampledWthrData
                );
                console.log('결합된 데이터', mergedData);

                console.log('수증기 분압차 계산중...');
                setProcess('수증기 분압차 계산중...');
                const { pi, po, pdiff } = calculateVaporPressure(mergedData);
                console.log('수증기 분압차 계산 완료', { pi, po, pdiff });

                const wTemp = mergedData.map((row) => row.wTemp);
                const mTemp = mergedData.map((row) => row.mTemp);

                console.log('hHumi, cHumi 계산중...');
                setProcess('hHumi, cHumi 계산중...');
                const { cHumi, cHumiRSquared, hHumi, hHumiRSquared, hPDiff } =
                    calculateHumi({
                        wTemp: wTemp,
                        pdiff,
                    });
                console.log('hHumi, cHumi 계산 완료', {
                    cHumi,
                    cHumiRSquared,
                    hHumi,
                    hHumiRSquared,
                    hPDiff,
                });

                console.log('hTemp, hTemp 계산중...');
                setProcess('hTemp, hTemp 계산중...');

                const {
                    cTemp,
                    cTempIn,
                    cTempRSquared,
                    hTemp,
                    hTempIn,
                    hTempRSquared,
                } = calculateTemp(wTemp, mTemp);
                console.log('hTemp, hTemp 계산 완료', {
                    cTemp,
                    cTempIn,
                    cTempRSquared,
                    hTemp,
                    hTempIn,
                    hTempRSquared,
                });

                const returnResult = {
                    cHumi: cHumi.toFixed(1),
                    hHumi: hHumi.toFixed(1),
                    hPDiff: hPDiff.toFixed(1),
                    cTemp: cTemp.toFixed(1),
                    cTempIn: cTempIn.toFixed(1),
                    hTemp: hTemp.toFixed(1),
                    hTempIn: hTempIn.toFixed(1),
                };
                console.log('계산 완료', returnResult);
                return returnResult;
            } else {
                setProcess('기상청 데이터 이동평균을 불러오지 못했습니다..');
            }
        } else {
            setProcess('측정 데이터 이동평균을 불러오지 못했습니다.');
        }
    } catch (error) {
        setProcess(`Error reading file: ${error}`);
    }
    return null;
};
