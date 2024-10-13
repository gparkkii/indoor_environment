import { DataRow } from './@types';
import { calculateVaporPressure } from './calculation';
import { getWthrDataList } from './kmaData';
import { calculate24HourMovingAverage } from './resampleData';
// CSV를 파싱하는 함수
const parseCSV = (csv: string): DataRow[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map((header) => header.trim());

    return lines.slice(1).map((line) => {
        const values = line.split(',').map((value) => value.trim());
        const row: DataRow = {
            stnId: Number(values[0]),
            tm: values[1],
            temp: Number(values[2]),
            humi: Number(values[3]),
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

        setProcess('측정 데이터 이동평균 구하는 중...');
        const resampledData = await calculate24HourMovingAverage(
            parsedData,
            'm'
        );
        console.log('측정 데이터 이동평균 :', { resampledData });

        if (resampledData && resampledData.length > 0) {
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

            setProcess('기상청 데이터 불러오는 중...');
            const wthrData = await getWthrDataList({
                startDt,
                startHh,
                endDt,
                endHh,
                stnIds,
            });
            console.log('기상청 데이터 :', { wthrData });

            setProcess('기상청 데이터 이동평균 구하는 중...');
            const resampledWthrData = await calculate24HourMovingAverage(
                wthrData,
                'w'
            );
            console.log('기상청 데이터 이동평균 :', { resampledWthrData });

            setProcess('측정 데이터 + 기상청 데이터 결합중..');
            if (resampledWthrData) {
                const mergedData = mergeDataByTime(
                    resampledData,
                    resampledWthrData
                );
                console.log('결합된 데이터', mergedData);

                setProcess('수증기 분압차 계산중...');
                const { pi, po, pdiff } = calculateVaporPressure(mergedData);
                setProcess('수증기 분압차 계산 완료');

                console.log('수증기 분압차 계산 완료', { pi, po, pdiff });
            } else {
                setProcess('결합할 기상청 데이터가 없습니다.');
            }
        } else {
            setProcess('No data available.');
        }
    } catch (error) {
        setProcess(`Error reading file: ${error}`);
    }
};
