export type User = {
    id: string;
    username: string;
    resId: string;
    roleId: string;
    status: number;
    email_verified_at: string | null;
    createdAt: string;
    updatedAt: string;
    role: {
        id: string;
        roleName: string;
        status: number;
    };
}

export type Member = {
    id: string,
    orgId: string,
    aptId: string,
    resId: string,
    fullname : string,
    email : string,
    phoneNumber :string,
    birthday : string,
    relationship:string,
    gender : string,
    cccd : string
    status?: string

}