import request from "@/utils/request.ts";
import type {AssignPermissionFormSchema} from "@/pages/authorization/role/assign-permission.tsx";

export const getAllPermissionAPI = async () => {
    return await request.get(`/permissions`);
}

export const assignPermissionAPI = async (permission: AssignPermissionFormSchema) => {
    const res = await request.post('/permissions/assign', permission);
    return res.data;
}
