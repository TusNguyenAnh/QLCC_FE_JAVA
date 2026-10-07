import request from "@/utils/request.ts";
import type {AptFormSchema} from "@/pages/apartment/action-form-apt.tsx";

export const getApartmentByBuilding = async (bdId: string) => {
    const res = await request.get(`/apartments/building/${bdId}`);
    return res.data;
}

export const createAptAPI = async (newApt: AptFormSchema) => {
    const res = await request.post('/apartments', newApt);
    return res.data;
}

export const updateAptAPI = async (updateApt: AptFormSchema, aptId: string) => {
    const res = await request.put(`/apartments/${aptId}`, updateApt);
    return res.data;
}

export const createAptUseFileAPI = async (formData: FormData) => {
    return await request.post("/apartments/import-excel", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteBdAPI = async (listBd:string[]) => {
    return await request.post('/bd/delete', {listBd: listBd});
}

