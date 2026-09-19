import request from "@/utils/request.ts";

export const getMediaFileAPI = async (ownerId: string) => {
    const res = await request.get(`/image/view/${ownerId}`);
    return res.data;
}