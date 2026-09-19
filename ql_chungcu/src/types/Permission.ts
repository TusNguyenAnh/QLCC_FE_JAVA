export type psModule = {
    moduleName: string;
    permission: psItem[];
}

export type psItem = {
    id: string;
    name?: string;
    module?: string,
    description: string,
    totalRoles?: number
}

