import request from "@/utils/request.ts";
import type {TaskReview, Task} from "@/types/Task.ts";
import type {FilterReqFormSchema} from "@/pages/replies/request/filter-form-request.tsx";
import type {PaginatedResponse} from "@/types/Pagination.ts";
import type {ExpenseFormSchema} from "@/pages/finance/expense/action-form-expense.tsx";

export const getAllTaskByOrgAPI = async (
    orgId: string,
    taskStatus: number,
    filterTask: FilterReqFormSchema,
    page = 1,
    perPage = 50
): Promise<PaginatedResponse<Task>> => {
    // Trả về toàn bộ response với message, data, meta, links
    return await request.post(
        `/task/org/${taskStatus}/${orgId}`,
        {
            ...filterTask,
            pageNumber: page,
            pageSize: perPage
        }
    );
};

export const getTaskApprovedAPI = async (
    orgId: string,
    filterTask: FilterReqFormSchema,
    page = 1,
    perPage = 50
): Promise<PaginatedResponse<Task>> => {
    // Trả về toàn bộ response với message, data, meta, links
    return await request.post(
        `/task/filter-task/${orgId}`,
        {...filterTask, pageNumber: page, pageSize: perPage}
    );
};

export const getTaskByCreatorAPI = async (
    taskStatus: string,
    filterTask: FilterReqFormSchema,
    page = 1,
    perPage = 50
): Promise<PaginatedResponse<Task>> => {
    // Trả về toàn bộ response với message, data, meta, links
    return await request.post(
        `/task/creator/${taskStatus}`,
        {...filterTask, pageNumber: page, pageSize: perPage}
    );
};

export const getWfByTaskAPI = async (taskId: string) => {
    const res = await request.get(`/task/workflow/${taskId}`);
    return res.data;
};
export const taskActionSummaryAPI = async () => {
    const res = await request.get("/task/task-summary");
    return res.data;
};

export const approveTaskAPI = async (
    taskReview: TaskReview,
    taskId: string
) => {
    const res = await request.put(`/task/approval/${taskId}`, taskReview);
    return res.data;
};
export const rejectTaskAPI = async (taskReview: TaskReview, taskId: string) => {
    const res = await request.put(`/task/rejection/${taskId}`, taskReview);
    return res.data;
};

export const createTaskAPI = async (formData: FormData | ExpenseFormSchema) => {
    const res = await request.post("/task", formData, {
        headers:
            formData instanceof FormData
                ? {
                    "Content-Type": "multipart/form-data",
                }
                : undefined,
    });
    return res.data;
};
