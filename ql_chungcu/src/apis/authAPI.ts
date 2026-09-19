import request from "@/utils/request.ts";
import type {LoginFormSchema} from "@/pages/authentication/login.tsx";
import type {LoginResponse, ProfileResponse} from "@/types/Authentication.ts";

export const login = async (account: LoginFormSchema): Promise<LoginResponse> => {
    return await request.post("/auth/login", account);
};

export const logoutUser = async () => {
    return await request.post("/auth/logout");
};

export const getProfile = async (): Promise<ProfileResponse> => {
    return await request.post("/auth/profile");
};
