import request from "@/utils/request.ts";
import type {OrgFormSchema} from "@/pages/organization/action-form-org.tsx";

export const getAllOrgAPI = async () => {
    const res = await request.get('/organizations');
    return res.data;
}

export const findByIdAPI = async (orgId: string) => {
    const res = await request.get(`/organizations/${orgId}`);
    return res.data;
}

export const getBdIdByOrgIdAPI = async (parentId: string) => {
    return await request.get(`/organizations/available-buildings`, {
        params: {
            parentId: parentId,
        },
    });
}


export const getAllOrgWithoutChildAPI = async (orgId: string, complexId: string) => {
    return await request.get(`/organizations/without-descendants`, {
        params: {
            parentOrgId: orgId,
            complexId: complexId,
        },
    });
}

export const getTopLevelOrg = async (complexId: string) => {
    return await request.get(`/organizations/top-level/${complexId}`);
}


export const createOrgAPI = async (newOrg: OrgFormSchema) => {
    const res = await request.post('/organizations', newOrg);
    return res.data;
}

export const updateOrgAPI = async (updateOrg: OrgFormSchema, orgId: string) => {
    const res = await request.put(`/organizations/${orgId}`, updateOrg);
    return res.data;
}

export const deleteOrgAPI = async (listOrg: string[]) => {
    return await request.post('/organizations/delete', listOrg);
}