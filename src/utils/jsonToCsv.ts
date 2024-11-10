export function jsonToCsv(jsonArray: { [key: string]: any }[], name: string) {
    // CSV 헤더와 데이터 생성
    const headers = Object.keys(jsonArray[0]).join(',');
    const rows = jsonArray.map((obj) => Object.values(obj).join(','));
    const csvData = [headers, ...rows].join('\n');

    // Blob 객체 생성
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.csv`;
    document.body.appendChild(link); // 링크를 DOM에 추가
    link.click(); // 클릭하여 다운로드 트리거
    document.body.removeChild(link); // 링크 삭제

    // URL 객체 해제
    URL.revokeObjectURL(url);
}
