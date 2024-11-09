export interface DataRow {
    stnId?: number;
    tm: string;
    temp: number;
    humi: number;
}

export interface ParsedDataRow {
    stnId?: number;
    tm: Date;
    temp: number;
    humi: number;
}

export interface MProcessedDataRow {
    tm: Date;
    mTemp: number;
    mHumi: number;
    userStnId?: number;
}

export interface WProcessedDataRow {
    tm: Date;
    wTemp: number;
    wHumi: number;
    userStnId?: number;
}

export interface processResult {
    cHumi: number;
    hHumi: number;
    hPDiff: number;
    cTemp: number;
    cTempIn: number;
    hTemp: number;
    hTempIn: number;
}
