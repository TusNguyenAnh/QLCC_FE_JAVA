import request from "@/utils/request.ts";

import type {FilterResFormSchema} from "@/pages/resident/filter-form-res.tsx";

export const getResByFilterAPI = async (filterRes: FilterResFormSchema) => {
    // Trả về toàn bộ response với message, data, meta, links
    return await request.post(`/resident/filter`, filterRes);
};

export const findByOrgId = async (orgId: string) => {
    return await request.get(`/resident/findByOrgId/${orgId}`);
};

export const findByBuildingIdAPI = async (buildingId: string[], orgId: string) => {
    return await request.post(`/resident/findByBuildingId/${orgId}`, buildingId);
};

export const addResInOrgAPI = async (userId: string[], org_id: string) => {
    const res = await request.post(`/resident/addResInOrg/${org_id}`, {
        userIds: userId,
    });
    return res.data;
};

export const removeResInOrgAPI = async (userId: string[], org_id: string) => {
    const res = await request.post(`/resident/removeResInOrg/${org_id}`, {
        userIds: userId,
    });
    return res.data;
};


export const updatePositionAPI = async (userId: string, orgId: string, position: string) => {
    const res = await request.post(`/resident/updatePosition`, {
        userId: userId,
        orgId: orgId,
        position: position,
    });
    return res.data;
};

export const createResUseFileAPI = async (formData: FormData) => {
    const res = await request.post("/resident/import-excel", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const createAptResUseFileAPI = async (formData: FormData) => {
    const res = await request.post("/resident/import-excelAptRes", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};
