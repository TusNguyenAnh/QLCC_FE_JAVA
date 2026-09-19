import {useContext, useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button.tsx";
import {getAllBdAPI} from "@/apis/bdAPI.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {getAllTaskTypeAPI} from "@/apis/taskTypeAPI.ts";
import SendReqForm, {
    type ReqFormSchema,
} from "@/pages/send-request/send-req-form.tsx";
import {
    createTaskAPI,
    getTaskByCreatorAPI,
} from "@/apis/taskAPI.ts";
import {RequestList} from "@/pages/replies/request/request-list.tsx";
import FilterReqForm, {
    type FilterReqFormSchema,
} from "@/pages/replies/request/filter-form-request.tsx";
import {getMediaFileAPI} from "@/apis/mediaFileAPI.ts";
import type {Task} from "@/types/Task.ts";
import type {listMediaFile} from "@/types/MediaFile.ts";
import {SendReqDetail} from "@/pages/send-request/send-req-detail.tsx";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {DataPagination} from "@/layouts/pagination/data-pagination.tsx";
import type {PaginationMeta} from "@/types/Pagination.ts";

export function SendRequest() {
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [listBd, setListBd] = useState([]);
    const [listTt, setListTt] = useState([]);
    const [listTaskPending, setListTaskPending] = useState<Task[] | []>([]);
    const [listTaskApproved, setListTaskApproved] = useState<Task[] | []>([]);
    const [listTaskRejected, setListTaskRejected] = useState<Task[] | []>([]);
    const [mediaFiles, setMediaFiles] = useState<listMediaFile | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<Task | null>(null);
    const [openReqDetail, setOpenReqDetail] = useState(false);

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

    const {complex} = useContext(AuthContext);

    const getAllTaskByCreator = async (
        taskStatus: string,
        filterTask: FilterReqFormSchema,
        page = 1,
        perPage = 50,
    ) => {
        setLoading(true);
        try {
            const response = await getTaskByCreatorAPI(
                taskStatus,
                filterTask,
                page,
                perPage,
            );

            if (taskStatus === "PENDING") {
                setPendingMeta({
                    page: response.result.page,
                    totalPages: response.result.totalPages,
                    size: response.result.size,
                    totalElements: response.result.totalElements,
                });
                setListTaskPending(response.result.data);
            } else if (taskStatus === "REJECTED") {
                setRejectedMeta({
                    page: response.result.page,
                    totalPages: response.result.totalPages,
                    size: response.result.size,
                    totalElements: response.result.totalElements,
                });
                setListTaskRejected(response.result.data);
            } else if (taskStatus === "APPROVED") {
                setApprovedMeta({
                    page: response.result.page,
                    totalPages: response.result.totalPages,
                    size: response.result.size,
                    totalElements: response.result.totalElements,
                });
                setListTaskApproved(response.result.data);
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

    // Fetch buildings
    const fetchBuildings = async () => {
        try {
            let data = await getAllBdAPI();

            const items = data.map((item) => ({
                label: item.buildingName,
                value: String(item.id),
            }));

            setListBd(items);
        } catch (error) {
            console.error("Error fetching buildings:", error);
            toast.error("Không thể tải danh sách tòa nhà");
        }
    };

    const getAllTaskType = async (complexId: string) => {
        try {
            const data = await getAllTaskTypeAPI(complexId);
            const items = data.map(function (item: {
                id: string;
                typeName: string;
            }) {
                return {
                    value: item.id,
                    label: item.typeName,
                };
            });
            setListTt(items);
        } catch (err) {
            console.log(err);
        }
    };

    const getMediaFile = async ($ownerId: string) => {
        try {
            const data = await getMediaFileAPI($ownerId);
            setMediaFiles(data);
        } catch (err) {
            console.log(err);
        }
    };

    const onSelectTask = (task: Task) => {
        setSelectedRequest(task);
        getMediaFile(task.id);
        setOpenReqDetail(true);
    };

    // xu ly khi nhan nut them moi
    const handleCreate = () => {
        fetchBuildings();
        getAllTaskType(complex);
        setOpenDialog(true);
    };

    // Handlers for pending requests pagination
    const handlePendingPageChange = (page: number) => {
        setPendingPage(page);
        getAllTaskByCreator("PENDING", pendingFilter, page, pendingPerPage);
    };

    const handlePendingPerPageChange = (perPage: number) => {
        setPendingPerPage(perPage);
        setPendingPage(1);
        getAllTaskByCreator("PENDING", pendingFilter, 1, perPage);
    };

    const handlePendingFilter = (filter: FilterReqFormSchema) => {
        setPendingFilter(filter);
        setPendingPage(1);
        getAllTaskByCreator("PENDING", filter, 1, pendingPerPage);
    };

    // Handlers for rejected requests pagination
    const handleRejectedPageChange = (page: number) => {
        setRejectedPage(page);
        getAllTaskByCreator("REJECTED", rejectedFilter, page, rejectedPerPage);
    };

    const handleRejectedPerPageChange = (perPage: number) => {
        setRejectedPerPage(perPage);
        setRejectedPage(1);
        getAllTaskByCreator("REJECTED", rejectedFilter, 1, perPage);
    };

    const handleRejectedFilter = (filter: FilterReqFormSchema) => {
        setRejectedFilter(filter);
        setRejectedPage(1);
        getAllTaskByCreator("REJECTED", filter, 1, rejectedPerPage);
    };

    // Handlers for approved requests pagination
    const handleApprovedPageChange = (page: number) => {
        setApprovedPage(page);
        getAllTaskByCreator("APPROVED", approvedFilter, page, approvedPerPage);
    };

    const handleApprovedPerPageChange = (perPage: number) => {
        setApprovedPerPage(perPage);
        setApprovedPage(1);
        getAllTaskByCreator("APPROVED", approvedFilter, 1, perPage);
    };

    const handleApprovedFilter = (filter: FilterReqFormSchema) => {
        console.log(filter);
        setApprovedFilter(filter);
        setApprovedPage(1);
        getAllTaskByCreator("APPROVED", filter, 1, approvedPerPage);
    };

    const submitCreateTask = async (data: ReqFormSchema) => {
        setLoading(true);
        try {
            // Tạo FormData để gửi files
            const formData = new FormData();
            formData.append("task_name", data.taskName);
            formData.append("tasktype_id", data.tasktypeId || "");
            formData.append("description", data.description || "");
            formData.append("category", "task");

            // Thêm building_id array
            if (data.buildingId && data.buildingId.length > 0) {
                data.buildingId.forEach((id) => {
                    formData.append("buildingId[]", id);
                });
            }

            // Thêm các file nếu có
            if (data.files && data.files.length > 0) {
                Array.from(data.files).forEach((file: any) => {
                    formData.append("files[]", file);
                });
            }

            await createTaskAPI(formData);
            toast.success("Thêm mới thành công!");
            setOpenDialog(false);
            // Refresh danh sách
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-2 md:flex-row">
                <Button className="hover: cursor-pointer mb-2" onClick={handleCreate}>
                    Thêm mới yều cầu, phản ánh
                </Button>

                <SendReqForm
                    open={openDialog}
                    setOpen={setOpenDialog}
                    loading={loading}
                    onSubmit={submitCreateTask}
                    itemsBd={listBd}
                    itemsTt={listTt}
                ></SendReqForm>
            </div>

            <Tabs defaultValue="requests" className="h-full flex flex-col">
                <TabsList className="mx-6 mt-4 w-fit">
                    <TabsTrigger
                        value="requests"
                        onClick={() => {
                            setPendingFilter({});
                            setPendingPage(1);
                            setPendingFilterKey((prev) => prev + 1);
                        }}
                    >
                        Yêu cầu chờ xét duyệt
                    </TabsTrigger>
                    <TabsTrigger
                        value="approved"
                        onClick={() => {
                            setApprovedFilter({});
                            setApprovedPage(1);
                            setApprovedFilterKey((prev) => prev + 1);
                        }}
                    >
                        Yêu cầu đã xét duyệt
                    </TabsTrigger>
                    <TabsTrigger
                        value="reject"
                        onClick={() => {
                            setRejectedFilter({});
                            setRejectedPage(1);
                            setRejectedFilterKey((prev) => prev + 1);
                        }}
                    >
                        Yêu cầu bị từ chối
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="flex-1 p-6 flex flex-col">
                    <FilterReqForm
                        key={pendingFilterKey}
                        onSubmitPdAndRj={(orgId, taskStatus, filter) =>
                            handlePendingFilter(filter)
                        }
                        type={"pd"}
                    />
                    <RequestList
                        requests={listTaskPending}
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
                        <SendReqDetail
                            request={selectedRequest}
                            mediaFiles={mediaFiles}
                            open={openReqDetail}
                            setOpen={setOpenReqDetail}
                        />
                    ) : null}
                </TabsContent>

                <TabsContent value="reject" className="flex-1 p-6 flex flex-col">
                    <FilterReqForm
                        key={rejectedFilterKey}
                        onSubmitPdAndRj={(orgId, taskStatus, filter) =>
                            handleRejectedFilter(filter)
                        }
                        type={"rj"}
                    />
                    <RequestList
                        requests={listTaskRejected}
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
                        <SendReqDetail
                            request={selectedRequest}
                            mediaFiles={mediaFiles}
                            open={openReqDetail}
                            setOpen={setOpenReqDetail}
                        />
                    ) : null}
                </TabsContent>

                <TabsContent value="approved" className="flex-1 p-6 flex flex-col">
                    <FilterReqForm
                        key={approvedFilterKey}
                        onSubmit={(orgId, filter) => handleApprovedFilter(filter)}
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
                        <SendReqDetail
                            request={selectedRequest}
                            mediaFiles={mediaFiles}
                            open={openReqDetail}
                            setOpen={setOpenReqDetail}
                        />
                    ) : null}
                </TabsContent>
            </Tabs>
        </>
    );
}
