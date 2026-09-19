export type Apt = {
    id: string;
    aptNumber: string;
    aptArea: number;
    status?: string;
    buildingId: string;
    aptType: string;
    description: string;
    floor: number;
}

export type fillItemApt = {
    id: string;
    aptNumber: string;
    grossArea: number;
    coefficient: number;
    description: string;
    buildingId: string;
    aptType: string;
    floor: number;
}

