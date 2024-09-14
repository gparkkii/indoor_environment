// 건물 용도
export const BUILDING_TYPE_OPTION: {
    label: BuildingType.label;
    value: BuildingType.value;
}[] = [
    { label: '주거용', value: 1 },
    { label: '상업용', value: 2 },
    { label: '교육사회용', value: 3 },
];

// 준공연도
export const YEAR_OPTION: { label: Year.label; value: Year.value }[] = [
    { label: '1987년 이전', value: 1 },
    { label: '1988 ~ 2000', value: 2 },
    { label: '2001 ~ 2010', value: 3 },
    { label: '2011 ~ 2017', value: 4 },
    { label: '2018년 이후', value: 5 },
];

// 건물
export const BUILDING_OPTION = [
    { label: '일반 건축물', value: 1 },
    // { label: '저에너지 건축물', value: 2 },
];
