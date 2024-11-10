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
    setProcess: (value: React.SetStateAction<string>) => void;
}): Promise<DataRow[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}?startDt=${startDt}&endDt=${endDt}&startHh=${startHh}&endHh=${endHh}&stnIds=${stnIds}`,
            { method: 'GET' }
        );
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let progressData = '';

        while (true && reader) {
            const { value, done } = await reader.read();
            if (done) break;

            progressData += decoder.decode(value, { stream: true });
            const lines = progressData.split('\n');

            // 마지막 줄이 완료되지 않은 JSON일 경우 다시 저장
            progressData = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim()) continue;
                const data = JSON.parse(line);

                if (data.progress) {
                    console.log(`${data.progress} of ${data.totalPages}`);
                    setProcess(
                        `${data.progress} of ${data.totalPages}<br/>기상청 데이터 불러오는 중...`
                    );
                    // Update progress bar or loading indicator here
                } else if (data.allData) {
                    console.log('All Data loaded : ', data.allData);
                    // Handle final data
                    setProcess('All Data loaded');
                    return data.allData as DataRow[];
                }
            }
        }
        return [];
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Error fetching weather data');
    }
};
