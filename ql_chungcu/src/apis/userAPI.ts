import request from "@/utils/request.ts";
import type {Resident} from "@/types/Resident.ts";
import type {FilterResUserFormSchema} from "@/pages/authorization/user/res/filter-form-user-res.tsx";

export const findResByOrgId = async (orgId: string) => {
    return await request.get(`/user/res/${orgId}`);
}

export const findStaffByOrgId = async (orgId: string) => {
    return await request.get(`/user/staff/${orgId}`);
}

export const createUserAPI = async (listRes: Resident[]) => {
    return await request.post('/user', listRes);
}

export const getUserByFilterAPI = async (
    filterUser: FilterResUserFormSchema,
) => {
    return await request.post(
        `/user/filter`,
        filterUser
    );
};