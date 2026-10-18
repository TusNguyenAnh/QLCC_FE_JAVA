import {useContext, useEffect, useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@radix-ui/react-dropdown-menu";
import {Input} from "@/components/ui/input.tsx";
import {Loader2, RotateCw} from "lucide-react";
import {createBdAPI, deleteBdAPI, getAllBdAPI, updateBdAPI} from "@/apis/bdAPI.ts";
import type {Building, fillItemBd} from "@/types/Building.ts";
import {DataTable} from "@/layouts/tables/data-table.tsx";
import {ColumnsBd} from "@/layouts/columns/column-tb-bd.tsx";
import BdForm, {type BdFormSchema} from "@/pages/building/action-form-bd.tsx";
import {columnLabelsBd} from "@/utils/column-label.ts";
import {useDebounce} from "use-debounce";
import {AuthContext} from "@/context/AuthContext.tsx";
import {DataMedia} from "@/layouts/media/data-media.tsx";
import type {listMediaFile} from "@/types/MediaFile.ts";
import {getMediaFileAPI} from "@/apis/mediaFileAPI.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";

export function Building() {
    const [openDialog, setOpenDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [building, setBuilding] = useState([]);
    const [bdUpdate, setBdUpdate] = useState({});
    const [action, setAction] = useState("CREATE");
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});
    const [mediaFiles, setMediaFiles] = useState<listMediaFile | null>(null);
    const [openMediaDialog, setOpenMediaDialog] = useState(false);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [selectedBdView, setSelectedBdView] = useState<fillItemBd | null>(null);
    const {complex} = useContext(AuthContext);


    const getMediaFile = async (buildingId: string[]) => {
        setMediaLoading(true);
        try {
            const data = await getMediaFileAPI(buildingId);
            setMediaFiles(data);
        } catch (err) {
            console.log(err);
            toast.error("Không thể tải tệp đính kèm!");
        } finally {
            setMediaLoading(false);
        }
    };

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

    const handleView = (bdView: fillItemBd): void => { // nhan tham so la thong tin hang can update
        setSelectedBdView(bdView);
        setOpenMediaDialog(true);
        getMediaFile([bdView.id]);
    };

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
                // Tạo FormData để gửi files
                const formData = new FormData();
                formData.append("complexId", data.complexId);
                formData.append("buildingName", data.buildingName);

                // Thêm các file nếu có
                if (data.files && data.files.length > 0) {
                    Array.from(data.files).forEach((file: any) => {
                        formData.append("files[]", file);
                    });
                }

                await createBdAPI(formData);
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
                <DataTable<Building, any> columns={ColumnsBd({handleUpdate, handleDelete, handleView})} data={building}
                                          handleDelete={handleDelete}
                                          columnLabels={columnLabelsBd}
                                          keyword={debouncedKeyword}
                                          rowSelection={rowSelection}
                                          setRowSelection={setRowSelection}
                />
            </div>

            {/* Modal hiển thị Hồ sơ kỹ thuật */}
            <Dialog open={openMediaDialog} onOpenChange={setOpenMediaDialog}>
                <DialogContent className="sm:max-w-4xl max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader className="pb-3 border-b border-border/60">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <span>Hồ sơ kỹ thuật</span>
                            {selectedBdView?.buildingName && (
                                <span className="text-primary font-semibold">
                                    - {selectedBdView.buildingName}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Danh sách hình ảnh, video và tài liệu kỹ thuật liên quan đến tòa nhà.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-1 pt-2">
                        {mediaLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                <span className="text-sm text-muted-foreground">Đang tải hồ sơ kỹ thuật...</span>
                            </div>
                        ) : (
                            <DataMedia
                                mediaFiles={mediaFiles}
                                title="Hồ sơ kỹ thuật"
                                showCard={false}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}


