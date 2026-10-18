import request from "@/utils/request.ts";
import type { Brief, BriefFilter, BriefPageResponse, UpdateBriefDTO } from "@/types/Brief.ts";

const BASE_URL = "/briefs";

export const getAllBriefsAPI = async (filter?: BriefFilter): Promise<BriefPageResponse> => {
    const res = await request.get(BASE_URL, { params: filter });
    if (res && typeof res === "object" && Array.isArray((res as any).data)) {
        return res as BriefPageResponse;
    }
    if (Array.isArray(res)) {
        return {
            data: res as Brief[],
            page: 0,
            size: (res as Brief[]).length,
            totalElements: (res as Brief[]).length,
            totalPages: 1,
        };
    }
    return { data: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
};

export const getBriefByIdAPI = async (id: string): Promise<Brief> => {
    const res = await request.get(`${BASE_URL}/${id}`);
    return res as Brief;
};

export const createBriefAPI = async (formData: FormData): Promise<Brief> => {
    const res = await request.post(BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res as Brief;
};

export const updateBriefAPI = async (
    id: string,
    data: UpdateBriefDTO
): Promise<Brief> => {
    const res = await request.put(`${BASE_URL}/${id}`, data);
    return res as Brief;
};

export const deleteBriefAPI = async (id: string): Promise<void> => {
    await request.delete(`${BASE_URL}/${id}`);
};
