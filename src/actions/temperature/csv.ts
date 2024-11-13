import { DataRow, MProcessedDataRow, WProcessedDataRow } from './@types';
import { calculateHeatingCoolingLimits } from '../../utils/calculateHeatingCooling';
import { calculateVaporPressure } from '../../utils/calculatePSaturated';
import { getWthrDataList } from './kmaData';
import { resampleCSVData, resampleWthrData } from '../../utils/resampleData';
import { jsonToCsv } from '../../utils/jsonToCsv';

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

    if (tm === -1 || temp === -1 || humi === -1) {
        return [];
    }

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
    measuredData: MProcessedDataRow[],
    weatherData: WProcessedDataRow[]
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
                wTemp: matchingWEntry.wTemp,
                wHumi: matchingWEntry.wHumi,
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
    setProcess: React.Dispatch<React.SetStateAction<string>>,
    stnId: number | null,
    cachedWeatherData: Record<string, any>,
    setCachedWeatherData: (key: string, data: any) => void,
    resetCachedWeatherData: () => void
) => {
    try {
        setProcess('측정 데이터 이동평균 구하는 중...');
        const parsedData = await handleFileUpload(file);

        if (parsedData.length < 1) {
            setProcess(
                '파일을 변환할 수 없습니다.<br/> 누락된 행이 있는지 다시 확인해주세요.'
            );
            return null;
        }

        console.log('측정 데이터 이동평균 구하는 중...');
        const { result: mResult, data: resampledData } =
            await resampleCSVData(parsedData);
        console.log('측정 데이터 이동평균 :', { resampledData });

        if (mResult === 'success') {
            const stnIds = resampledData[0]?.userStnId ?? stnId; // stnIds
            const firstDate = resampledData[0].tm; // 최초 일자
            const lastDate = resampledData[resampledData.length - 1].tm; // 마지막 일자

            const startDt =
                `${firstDate.getFullYear()}` +
                `${padStringFormat(firstDate.getMonth() + 1)}` +
                `${padStringFormat(firstDate.getDate() - 1)}`;
            const startHh = `${padStringFormat(firstDate.getHours())}`;

            const endDt =
                `${lastDate.getFullYear()}` +
                `${padStringFormat(lastDate.getMonth() + 1)}` +
                `${padStringFormat(lastDate.getDate())}`;
            const endHh = `${padStringFormat(lastDate.getHours())}`;

            const cacheKey = `${stnId}-${startDt}-${endDt}-${startHh}-${endHh}-${file.name}`;

            console.log('기상청 데이터 불러오는 중...');
            if (!stnIds) {
                throw new Error(`관측소 데이터를 찾을 수 없습니다.`);
            }
            setProcess('기상청 데이터 불러오는 중...');

            // const wthrData = cachedWeatherData[cacheKey]
            //     ? cachedWeatherData[cacheKey]
            //     : await getWthrDataList({
            //           startDt,
            //           startHh,
            //           endDt,
            //           endHh,
            //           stnIds: stnIds.toString(),
            //           setProcess,
            //       });

            // setCachedWeatherData(cacheKey, wthrData);

            const wthrData = await getWthrDataList({
                startDt,
                startHh,
                endDt,
                endHh,
                stnIds: stnIds.toString(),
                setProcess,
            });

            console.log('기상청 데이터 :', { wthrData });
            // jsonToCsv(wthrData, '기상청데이터');

            console.log('기상청 데이터 이동평균 구하는 중...');
            const { result: wResult, data: resampledWthrData } =
                await resampleWthrData(wthrData);
            console.log('기상청 데이터 이동평균 :', wResult, resampledWthrData);
            // jsonToCsv(resampledWthrData, '기상청데이터이동평균');

            console.log('측정 데이터 + 기상청 데이터 결합중..');
            setProcess('측정 데이터 + 기상청 데이터 결합중..');
            if (wResult === 'success') {
                const mergedData = mergeDataByTime(
                    resampledData,
                    resampledWthrData
                );
                console.log('결합된 데이터', mergedData);
                // jsonToCsv(mergedData, '측정데이터이동평균결합');

                console.log('수증기 분압차 계산중...');
                setProcess('수증기 분압차 계산중...');
                const { pi, po, pdiff, p_sat_i, p_sat_o } =
                    calculateVaporPressure(mergedData);
                console.log('수증기 분압차 계산 완료', {
                    p_sat_i,
                    p_sat_o,
                    pi,
                    po,
                    pdiff,
                });

                // jsonToCsv(
                //     [
                //         {
                //             p_sat_i,
                //             p_sat_o,
                //             pi,
                //             po,
                //             pdiff,
                //         },
                //     ],
                //     '수증기분압차결합'
                // );

                const wTemp = mergedData.map((row) => row.wTemp);
                const mTemp = mergedData.map((row) => row.mTemp);

                console.log('hHumi, cHumi 계산중...');
                setProcess('hHumi, cHumi 계산중...');
                const value = calculateHeatingCoolingLimits({
                    wTemp,
                    mTemp,
                    p_diff: pdiff,
                });

                console.log('hTemp, hTemp 계산중...');
                setProcess('hTemp, hTemp 계산중...');

                console.log('hHumi, cHumi, hTemp, hTemp 계산 완료', value);
                // jsonToCsv([value], '계산 완료');
                setProcess('계산 완료');
                return value;
            } else {
                setProcess('기상청 데이터 이동평균을 불러오지 못했습니다..');
                resetCachedWeatherData();
            }
        } else {
            setProcess('측정 데이터 이동평균을 불러오지 못했습니다.');
            resetCachedWeatherData();
        }
    } catch (error) {
        setProcess(`${error}`);
        resetCachedWeatherData();
    }
    return null;
};
