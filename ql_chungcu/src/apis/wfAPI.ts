import request from "@/utils/request.ts";
import type {WorkflowFormSchema} from "@/pages/business/action-form-workflow.tsx";

export const getAllWfAPI = async (complexId:string) => {
    const res = await request.get(`/workflow`);
    return res.data;
}

export const createWfAPI = async (newWf: WorkflowFormSchema) => {
    const res = await request.post('/workflow', newWf);
    return res.data;
}

