import {Button} from "@/components/ui/button.tsx";
import {Label} from "@radix-ui/react-dropdown-menu";
import {Input} from "@/components/ui/input.tsx";
import {RotateCw} from "lucide-react";
import {columnLabelsTt} from "@/utils/column-label.ts";
import {DataTable} from "@/layouts/tables/data-table.tsx";
import {useContext, useEffect, useState} from "react";
import {useDebounce} from "use-debounce";

import {createTaskTypeAPI, getAllTaskTypeAPI} from "@/apis/taskTypeAPI.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {ColumnsTt} from "@/layouts/columns/column-tb-tt.tsx";
import type {fillItemTt} from "@/types/TaskType.ts";
import TaskTypeForm, {type TaskTypeFormSchema} from "@/pages/replies/task-type/action-form-tt.tsx";
import {toast} from "sonner";
import {getAllPriorityAPI} from "@/apis/priorityAPI.ts";
import {getAllWfAPI} from "@/apis/wfAPI.ts";

export function TaskType() {
    const [openDialog, setOpenDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [taskType, setTaskType] = useState([]);
    const [taskTypeUpdate, setTaskTypeUpdate] = useState({priority: {id: ""}});
    const [listPriority, setListPriority] = useState([]);
    const [listWf, setListWf] = useState([]);


    const [action, setAction] = useState("CREATE");
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});
    const {complex} = useContext(AuthContext);

    const handleCreate = () => {
        setTaskTypeUpdate({priority: {id: ""}});
        // getAllOrgWithoutChild('00000000-0000-0000-0000-000000000000')
        // getAllBuilding()
        setAction("CREATE")
        setOpenDialog(true)
    }

    const handleUpdate = (taskTypeUpdate: fillItemTt): void => { // nhan tham so la thong tin hang can update
        setAction("UPDATE")
        setOpenDialog(true)
    }

    const handleDelete = async (listTt: string[]): void => { // nhan tham so la thong tin hang can update
    }

    const getAllTaskType = async (complexId: string) => {
        try {
            const data = await getAllTaskTypeAPI(complexId)
            setTaskType(data);
        } catch (err) {
            console.log(err);
        }
    }

    const getPriority = async () => {
        try {
            const data = await getAllPriorityAPI()

            const items = data.map(function (item: { id: string; priorityName: string }) {
                return ({
                    value: item.id,
                    label: item.priorityName,
                });
            });
            setListPriority(items);
        } catch (err) {
            console.log(err);
        }
    }

    const getAllWorkflow = async (complexId: string) => {
        try {
            const data = await getAllWfAPI(complexId)
            const items = data.map(function (item: { id: string; workflowName: string }) {
                return ({
                    value: item.id,
                    label: item.workflowName,
                });
            });
            setListWf(items);
        } catch (err) {
            console.log(err);
        }
    }

    const submitCreateOrUpdate = async (data: TaskTypeFormSchema) => {
        setLoading(true);
        try {
            if (action === "CREATE") {
                await createTaskTypeAPI(data);
                await getAllTaskType(complex);
            } else {
                // await updateOrgAPI(data, orgId);
            }
            toast.success(action == "CREATE" ? "Thêm mới thành công!" : "Cập nhật thông tin thành công!")
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllTaskType(complex);
        getPriority();
        getAllWorkflow(complex);
    }, [])


    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-2 md:flex-row">
                <Button className="hover: cursor-pointer" onClick={handleCreate}>Thêm mới</Button>
                <TaskTypeForm open={openDialog}
                              setOpen={setOpenDialog}
                              loading={loading}
                              action={action}
                              formData={taskTypeUpdate}
                              itemsPriority={listPriority}
                              itemsWf={listWf}
                              onSubmit={submitCreateOrUpdate}>
                </TaskTypeForm>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 md:flex-row">
                <Label>Thu gọn</Label>
                <Input type="text" placeholder="Nhập từ khóa tìm kiếm" value={keyword}
                       onChange={e => setKeyword(e.target.value)} className="w-1/6"/>
                <RotateCw className="hover: cursor-pointer" onClick={() => setKeyword("")}/>
            </div>

            <div className="p-4 mt-4 border border-gray-300 rounded-xl">
                <DataTable columns={ColumnsTt({handleUpdate, handleDelete})} data={taskType}
                           handleDelete={handleDelete}
                           keyword={debouncedKeyword}
                           rowSelection={rowSelection}
                           setRowSelection={setRowSelection}
                           columnLabels={columnLabelsTt}
                />
            </div>
        </>
    )
}