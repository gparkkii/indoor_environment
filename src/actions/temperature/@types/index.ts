export interface DataRow {
    stnId: number;
    tm: string;
    temp: number;
    humi: number;
}

export interface ParsedDataRow {
    stnId: number;
    tm: Date;
    temp: number;
    humi: number;
}

export interface ProcessedDataRow extends ParsedDataRow {
    mTemp?: number;
    mHumi?: number;
    wTemp?: number;
    wHumi?: number;
    userStnId: number;
}
