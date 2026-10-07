import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {RequestList} from "./request/request-list.tsx";
import {RequestDetails} from "./request/request-details.tsx";
import {StatsCards} from "./overview/stats-cards..tsx";
import {useContext, useEffect, useState} from "react";
import {TaskType} from "@/pages/replies/task-type/task-type.tsx";
import type {ActionSummary, Task, TaskWorkflow} from "@/types/Task.ts";
import {
    approveTaskAPI,
    getAllTaskByOrgAPI,
    getTaskApprovedAPI,
    getWfByTaskAPI,
    rejectTaskAPI,
    taskActionSummaryAPI,
} from "@/apis/taskAPI.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {toast} from "sonner";
import FilterReqForm, {
    type FilterReqFormSchema,
} from "@/pages/replies/request/filter-form-request.tsx";
import {DataPagination} from "@/layouts/pagination/data-pagination.tsx";
import type {PaginationMeta} from "@/types/Pagination.ts";
import type {listMediaFile} from "@/types/MediaFile.ts";
import {getMediaFileAPI} from "@/apis/mediaFileAPI.ts";
import {STATUS} from "@/utils/reply-constant.ts";

function Reply() {
    const [selectedRequest, setSelectedRequest] = useState<Task | null>(null);
    const [listTask, setListTask] = useState<Task[] | []>([]);
    const [listTaskApproved, setListTaskApproved] = useState<Task[] | []>([]);
    const [lengthTaskPending, setLengthTaskPending] = useState<number>(0);
    const [workflowTask, setWorkflowTask] = useState<TaskWorkflow[] | null>(null);
    const [taskAction, setTaskAction] = useState<ActionSummary[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [openReqDetail, setOpenReqDetail] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<listMediaFile | null>(null);

    // Key để reset filter form khi chuyển tab
    const [pendingFilterKey, setPendingFilterKey] = useState(0);
    const [rejectedFilterKey, setRejectedFilterKey] = useState(0);
    const [approvedFilterKey, setApprovedFilterKey] = useState(0);

    // Pagination states for pending requests
    const [pendingMeta, setPendingMeta] = useState<PaginationMeta>({
        page: 0,
        totalPages: 1,
        size: 50,
        totalElements: 0,
    });
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingPerPage, setPendingPerPage] = useState(50);
    const [pendingFilter, setPendingFilter] = useState<FilterReqFormSchema>({});

    // Pagination states for rejected requests
    const [rejectedMeta, setRejectedMeta] = useState<PaginationMeta>({
        page: 0,
        totalPages: 1,
        size: 50,
        totalElements: 0,
    });
    const [rejectedPage, setRejectedPage] = useState(1);
    const [rejectedPerPage, setRejectedPerPage] = useState(50);
    const [rejectedFilter, setRejectedFilter] = useState<FilterReqFormSchema>({});

    // Pagination states for approved requests
    const [approvedMeta, setApprovedMeta] = useState<PaginationMeta>({
        page: 0,
        totalPages: 1,
        size: 50,
        totalElements: 0,
    });
    const [approvedPage, setApprovedPage] = useState(1);
    const [approvedPerPage, setApprovedPerPage] = useState(50);
    const [approvedFilter, setApprovedFilter] = useState<FilterReqFormSchema>({});

    const {orgManage} = useContext(AuthContext);

    const getWorkflowForTask = async ($taskId: string) => {
        try {
            const data = await getWfByTaskAPI($taskId);
            setWorkflowTask(data);
        } catch (err) {
            console.log(err);
        }
    };


    const getAllTaskByOrg = async (
        orgId: string,
        taskStatus: number,
        filterTask: FilterReqFormSchema,
        page = 1,
        perPage = 50,
        updateTotalCount = false // Flag để quyết định có cập nhật total count không
    ) => {
        setLoading(true);
        try {
            const response = await getAllTaskByOrgAPI(
                orgId,
                taskStatus,
                filterTask,
                page,
                perPage
            );
            if (taskStatus === 2) {
                // Chỉ cập nhật tổng số khi có yêu cầu mới hoặc click tab tổng quan
                // KHÔNG cập nhật khi filter vì filter không phản ánh tổng số thực tế
                if (updateTotalCount) {
                    setLengthTaskPending(response.totalElements);
                }
                setPendingMeta({
                    page: response.page,
                    totalPages: response.totalPages,
                    size: response.size,
                    totalElements: response.totalElements,
                });
                setListTask(response.data);
            } else if (taskStatus === 3) {
                setRejectedMeta({
                    page: response.page,
                    totalPages: response.totalPages,
                    size: response.size,
                    totalElements: response.totalElements,
                });
                setListTask(response.data);
            }
            setSelectedRequest(null);
        } catch (err) {
            console.log(err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 200);
        }
    };

    const getTaskApproved = async (
        orgId: string,
        filterTask: FilterReqFormSchema,
        page = 1,
        perPage = 50
    ) => {
        setLoading(true);
        try {
            const response = await getTaskApprovedAPI(
                orgId,
                filterTask,
                page,
                perPage
            );
            setApprovedMeta({
                page: response.page,
                totalPages: response.totalPages,
                size: response.size,
                totalElements: response.totalElements,
            });
            setListTaskApproved(response.data);
            setSelectedRequest(null);
        } catch (err) {
            console.log(err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 200);
        }
    };

    const taskActionSummary = async () => {
        try {
            const data = await taskActionSummaryAPI();
            setTaskAction(data);
            // Cập nhật tổng số yêu cầu pending khi vào tab tổng quan
            await getAllTaskByOrg(orgManage, 2, {}, 1, 50, true);
        } catch (err) {
            console.log(err);
        }
    };

    const onSelectTask = (task: Task) => {
        setSelectedRequest(task);
        getWorkflowForTask(task.id);
        setOpenReqDetail(true);
    };

    const submitApproveOrReject = async (
        action: string,
        comment: string,
        taskId: string,
        stepOrder: number
    ) => {
        setLoading(true);
        const data = {
            action: action,
            comment: comment,
            stepOrder: stepOrder
        };
        try {
            if (action === "APPROVED") {
                await approveTaskAPI(data, taskId);
            } else {
                await rejectTaskAPI(data, taskId);
            }
            getAllTaskByOrg(
                orgManage,
                2,
                pendingFilter,
                pendingPage,
                pendingPerPage,
                true
            ); // CẬP NHẬT total sau khi approve/reject
            setSelectedRequest(null);
            toast.success(
                action == "APPROVED"
                    ? "Phê duyệt thành công!"
                    : "Đã từ chối xét duyệt yêu cầu!"
            );
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers for pending requests pagination
    // 1. Thay đổi trang
    const handlePendingPageChange = (page: number) => {
        setPendingPage(page);
        getAllTaskByOrg(orgManage, 2, pendingFilter, page, pendingPerPage, false); // Không cập nhật total khi chỉ chuyển trang
    };
    // 2. Thay đổi số bản ghi trên trang
    const handlePendingPerPageChange = (perPage: number) => {
        setPendingPerPage(perPage);
        setPendingPage(1);
        getAllTaskByOrg(orgManage, 2, pendingFilter, 1, perPage, false); // Không cập nhật total khi chỉ thay đổi perPage
    };
    // 3. Áp dụng filter
    const handlePendingFilter = (
        orgId: string,
        taskStatus: number,
        filter: FilterReqFormSchema
    ) => {
        setPendingFilter(filter);
        setPendingPage(1);
        getAllTaskByOrg(orgId, taskStatus, filter, 1, pendingPerPage, false); // KHÔNG cập nhật total khi filter
    };

    // Handlers for rejected requests pagination
    const handleRejectedPageChange = (page: number) => {
        setRejectedPage(page);
        getAllTaskByOrg(orgManage, 3, rejectedFilter, page, rejectedPerPage);
    };

    const handleRejectedPerPageChange = (perPage: number) => {
        setRejectedPerPage(perPage);
        setRejectedPage(1);
        getAllTaskByOrg(orgManage, 3, rejectedFilter, 1, perPage);
    };

    const handleRejectedFilter = (
        orgId: string,
        taskStatus: number,
        filter: FilterReqFormSchema
    ) => {
        setRejectedFilter(filter);
        setRejectedPage(1);
        getAllTaskByOrg(orgId, taskStatus, filter, 1, rejectedPerPage);
    };

    // Handlers for approved requests pagination
    const handleApprovedPageChange = (page: number) => {
        setApprovedPage(page);
        getTaskApproved(orgManage, approvedFilter, page, approvedPerPage);
    };

    const handleApprovedPerPageChange = (perPage: number) => {
        setApprovedPerPage(perPage);
        setApprovedPage(1);
        getTaskApproved(orgManage, approvedFilter, 1, perPage);
    };

    const handleApprovedFilter = (orgId: string, filter: FilterReqFormSchema) => {
        setApprovedFilter(filter);
        setApprovedPage(1);
        getTaskApproved(orgId, filter, 1, approvedPerPage);
    };

    useEffect(() => {
        taskActionSummary(); // Sẽ tự động cập nhật total count
    }, []);

    return (
        <>
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="overview" className="h-full flex flex-col">
                    <TabsList className="mx-6 mt-4 w-fit">
                        <TabsTrigger value="overview" onClick={taskActionSummary}>
                            Tổng quan
                        </TabsTrigger>
                        <TabsTrigger
                            value="requests"
                            onClick={() => {
                                setPendingFilter({}); // Reset filter về mặc định
                                setPendingPage(1); // Reset về trang 1
                                setPendingFilterKey((prev) => prev + 1); // Force re-render form
                                getAllTaskByOrg(orgManage, 2, {}, 1, pendingPerPage, false);
                            }}
                        >
                            Yêu cầu cần xét duyệt
                        </TabsTrigger>
                        <TabsTrigger
                            value="reject"
                            onClick={() => {
                                setRejectedFilter({}); // Reset filter về mặc định
                                setRejectedPage(1); // Reset về trang 1
                                setRejectedFilterKey((prev) => prev + 1); // Force re-render form
                                getAllTaskByOrg(orgManage, 3, {}, 1, rejectedPerPage, false);
                            }}
                        >
                            Yêu cầu bị từ chối
                        </TabsTrigger>

                        <TabsTrigger
                            value="approved"
                            onClick={() => {
                                setApprovedFilter({}); // Reset filter về mặc định
                                setApprovedPage(1); // Reset về trang 1
                                setApprovedFilterKey((prev) => prev + 1); // Force re-render form
                                getTaskApproved(orgManage, {}, 1, approvedPerPage);
                            }}
                        >
                            Yêu cầu đã xét duyệt
                        </TabsTrigger>

                        <TabsTrigger value="task_type">Danh sách loại yêu cầu</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex-1 p-6 space-y-6">
                        <StatsCards
                            taskAction={taskAction}
                            pendingReviewTotal={lengthTaskPending}
                        />
                    </TabsContent>

                    <TabsContent value="requests" className="flex-1 p-6 flex flex-col">
                        <FilterReqForm
                            key={pendingFilterKey}
                            onSubmitPdAndRj={handlePendingFilter}
                            orgId={orgManage}
                            type={"pd"}
                        />
                        <RequestList
                            requests={listTask}
                            onSelectRequest={onSelectTask}
                            loading={loading}
                            type={"pd"}
                        />
                        {pendingMeta && pendingMeta.totalPages > 0 && (
                            <DataPagination
                                meta={pendingMeta}
                                onPageChange={handlePendingPageChange}
                                onPerPageChange={handlePendingPerPageChange}
                            />
                        )}
                        {selectedRequest ? (
                            <RequestDetails
                                request={selectedRequest}
                                workflow={workflowTask}
                                onSubmit={submitApproveOrReject}
                                open={openReqDetail}
                                setOpen={setOpenReqDetail}
                            />
                        ) : null}
                    </TabsContent>

                    <TabsContent value="reject" className="flex-1 p-6 flex flex-col">
                        <FilterReqForm
                            key={rejectedFilterKey}
                            onSubmitPdAndRj={handleRejectedFilter}
                            orgId={orgManage}
                            type={"rj"}
                        />
                        <RequestList
                            requests={listTask}
                            onSelectRequest={onSelectTask}
                            loading={loading}
                            type={"rj"}
                        />
                        {rejectedMeta && rejectedMeta.totalPages > 0 && (
                            <DataPagination
                                meta={rejectedMeta}
                                onPageChange={handleRejectedPageChange}
                                onPerPageChange={handleRejectedPerPageChange}
                            />
                        )}
                        {selectedRequest ? (
                            <RequestDetails
                                request={selectedRequest}
                                workflow={workflowTask}
                                onSubmit={submitApproveOrReject}
                                open={openReqDetail}
                                setOpen={setOpenReqDetail}
                            />
                        ) : null}
                    </TabsContent>

                    <TabsContent value="approved" className="flex-1 p-6 flex flex-col">
                        <FilterReqForm
                            key={approvedFilterKey}
                            onSubmit={handleApprovedFilter}
                            orgId={orgManage}
                            type={"apd"}
                        />
                        <RequestList
                            requests={listTaskApproved}
                            onSelectRequest={onSelectTask}
                            loading={loading}
                            type={"apd"}
                        />
                        {approvedMeta && approvedMeta.totalPages > 0 && (
                            <DataPagination
                                meta={approvedMeta}
                                onPageChange={handleApprovedPageChange}
                                onPerPageChange={handleApprovedPerPageChange}
                            />
                        )}
                        {selectedRequest ? (
                            <RequestDetails
                                open={openReqDetail}
                                setOpen={setOpenReqDetail}
                                request={selectedRequest}
                                workflow={workflowTask}
                                onSubmit={submitApproveOrReject}
                            />
                        ) : null}
                    </TabsContent>

                    <TabsContent value="task_type" className="flex-1 p-6">
                        <TaskType/>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

export default Reply;
