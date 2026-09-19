export type Building = {
    id: string,
    complexId: string,
    buildingName: string,
    status?: string,
    financialRatio: number,
}

export type fillItemBd = {
    id: string,
    complexId: string,
    buildingName: string,
    address: string,
}

export type bdItemCheckbox = {
    id: string;
    buildingName: string;
}
