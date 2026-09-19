import request from "@/utils/request.ts";
import type {BdFormSchema} from "@/pages/building/action-form-bd.tsx";

export const getAllBdAPI = async () => {
    return await request.get(`/building`);
}

export const createBdAPI = async (newBd: BdFormSchema) => {
    const res = await request.post('/building', newBd);
    return res.data;
}

export const updateBdAPI = async (updateBd: BdFormSchema, bdId: string) => {
    const res = await request.put(`/building/${bdId}`, updateBd);
    return res.data;
}

export const deleteBdAPI = async (listBd: string[]) => {
    return await request.post('/building/delete', listBd);
}

export const updateRatioAPI = async (config: any) => {
    const res = await request.post("/building/ratio/update", config);
    return res.data;
};