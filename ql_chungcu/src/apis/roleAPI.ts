import request from "@/utils/request.ts";
import type {RoleFormSchema} from "@/pages/authorization/role/action-form-role.tsx";
import type {AssignRoleFormSchema} from "@/pages/authorization/user/assign-role.tsx";

export const getAllRoleAPI = async (complexId: string) => {
    const res = await request.get(`/role`);
    return res.data;
}

export const countUserByRoleAPI = async () => {
    return await request.get(`/role/count-user`);
}

export const countPermissionByRoleAPI = async () => {
    return await request.get(`/role/count-permission`);
}

export const createRoleAPI = async (newRole: RoleFormSchema) => {
    const res = await request.post('/role', newRole);
    return res.data;
}

export const getRoleByUserAPI = async (userId: string, orgId: string) => {
    return await request.get(`/role/user/${userId}/org/${orgId}`);
}

export const assignRoleAPI = async (role: AssignRoleFormSchema) => {
    const res = await request.post('/role/user', role);
    return res.data;
}
