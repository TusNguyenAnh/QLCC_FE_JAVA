import request from "@/utils/request.ts";

export const getMediaFileAPI = async (ownerId: string[]) => {
    return await request.post(`/files/view`, ownerId);
}

// Upload file độc lập với việc phê duyệt (backend: @RequestParam files, ownerType, ownerId)
export const uploadMediaFileAPI = async (
    files: File[],
    ownerType: string,
    ownerId: string | undefined
) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("ownerType", ownerType);
    formData.append("ownerId", ownerId);
    return await request.post("/files", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });
};