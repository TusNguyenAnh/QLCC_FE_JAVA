export type Resident = {
    id: string,
    // org_id: string,
    aptId: string,
    fullname : string,
    email : string,
    phoneNumber :string,
    birthday : string,
    relationship:string,
    gender : string,
    cccd : string
    status?: string
    // position?: string
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
