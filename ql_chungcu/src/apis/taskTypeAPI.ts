import request from "@/utils/request.ts";
import type {TaskTypeFormSchema} from "@/pages/replies/task-type/action-form-tt.tsx";

export const getAllTaskTypeAPI = async (complexId:string) => {
    const res = await request.get(`/task-type`);
    return res.data;
}

export const createTaskTypeAPI = async (newTt: TaskTypeFormSchema) => {
    const res = await request.post('/task-type', newTt);
    return res.data;
}