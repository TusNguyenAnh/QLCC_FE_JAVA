import {useContext, useEffect, useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@radix-ui/react-dropdown-menu";
import {Input} from "@/components/ui/input.tsx";
import {RotateCw} from "lucide-react";
import {createBdAPI, deleteBdAPI, getAllBdAPI, updateBdAPI} from "@/apis/bdAPI.ts";
import type {Building, fillItemBd} from "@/types/Building.ts";
import {DataTable} from "@/layouts/tables/data-table.tsx";
import {ColumnsBd} from "@/layouts/columns/column-tb-bd.tsx";
import BdForm, {type BdFormSchema} from "@/pages/building/action-form-bd.tsx";
import {columnLabelsBd} from "@/utils/column-label.ts";
import {useDebounce} from "use-debounce";
import {AuthContext} from "@/context/AuthContext.tsx";

export function Building() {
    const [openDialog, setOpenDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [building, setBuilding] = useState([]);
    const [bdUpdate, setBdUpdate] = useState({});
    const [action, setAction] = useState("CREATE");
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});
    const {complex} = useContext(AuthContext);


    //Lay tat ca cac phong ban
    useEffect(() => {
        getAllBdAPI().then(data => {
            setBuilding(data);
        })
    }, [])

    // xu ly khi nhan nut them moi
    const handleCreate = () => {
        setBdUpdate({complexId: complex}) // complexId se lay trong localstorage hoac co the lay tu api
        setAction("CREATE")
        setOpenDialog(true)
    }

    // xu ly khi nhan nut sua
    const handleUpdate = (bdUpdate: fillItemBd): void => { // nhan tham so la thong tin hang can update
        setBdUpdate(bdUpdate)
        setAction("UPDATE")
        setOpenDialog(true)
    }

    const handleDelete = async (listBd: string[]): void => { // nhan tham so la thong tin hang can update
        await deleteBdAPI(listBd)
        const buildings = await getAllBdAPI();
        setBuilding(buildings);
        setRowSelection({})
    }

    //submit form
    const submitCreateOrUpdate = async (data: BdFormSchema, bdId: string) => {
        setLoading(true);
        try {
            if (action === "CREATE") {
                await createBdAPI(data);
            } else {
                await updateBdAPI(data, bdId);
            }
            const buildings = await getAllBdAPI();
            setBuilding(buildings);
            toast.success(action == "CREATE" ? "Thêm mới thành công!" : "Cập nhật thông tin thành công!")
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-2 md:flex-row">
                <Button className="hover: cursor-pointer" onClick={handleCreate}>Thêm mới</Button>

                <BdForm open={openDialog}
                        setOpen={setOpenDialog}
                        loading={loading}
                        action={action}
                        formData={bdUpdate}
                        onSubmit={submitCreateOrUpdate}>
                </BdForm>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 md:flex-row">
                <Label>Thu gọn</Label>
                <Input type="text" placeholder="Nhập từ khóa tìm kiếm" value={keyword}
                       onChange={e => setKeyword(e.target.value)} className="w-1/5"/>
                <RotateCw className="hover: cursor-pointer" onClick={() => setKeyword("")}/>
            </div>

            <div className="p-4 mt-4 border border-gray-300 rounded-xl">
                <DataTable<Building,any> columns={ColumnsBd({handleUpdate, handleDelete})} data={building} handleDelete={handleDelete}
                           columnLabels={columnLabelsBd}
                           keyword={debouncedKeyword}
                           rowSelection={rowSelection}
                           setRowSelection={setRowSelection}
                />
            </div>
        </>
    )
}


