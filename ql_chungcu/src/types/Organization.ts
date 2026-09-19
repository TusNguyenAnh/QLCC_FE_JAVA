export type Org = {
    id: string;
    orgCode: string;
    orgName: string;
    description: string;
    parentOrgId: string;
    status?: string;
    children?: Org[];
    buildingIds: string[];
}

export type fillItemOrg = {
    id: string;
    orgCode: string;
    orgName: string;
    description: string;
    parentOrgId: string;
    building: string[];
}

export type orgWithoutChild = {
    id: string;
    orgName: string;
}

export type memberOrg = {
    id: string;
    fullname: string;
}
