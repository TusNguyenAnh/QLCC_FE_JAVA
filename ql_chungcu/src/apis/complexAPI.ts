import request from "@/utils/request.ts";

export const createComplexAPI = async (formData: FormData) => {
    return await request.post("/complex", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const findComplexByIdAPI = async (complexId: string) => {
    return await request.get(`/complex/${complexId}`);
}

export const filterComplexAPI = async (
    status: string,
    page = 1,
    perPage = 50
) => {
    // Trả về toàn bộ response với message, data, meta, links
    const res = await request.post(
        `/complex/filter/${status}`,{
            pageNumber: page,
            pageSize: perPage,
        });

    return res.data;
};
