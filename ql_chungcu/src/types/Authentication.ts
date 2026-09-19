import type {Resident} from "./Resident";

export interface User {
    id: string;
    username: string;
    complexId: string;
    resId: string;
    status: number;
    email_verified_at: string | null;
    createdAt: string | null;
    updatedAt: string;
    deletedAt: string | null;
    resident: Resident | null;
}

export interface ProfileResponse {
    user: User;
    permissions: string[];
    orgId: string;
}

export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
}
