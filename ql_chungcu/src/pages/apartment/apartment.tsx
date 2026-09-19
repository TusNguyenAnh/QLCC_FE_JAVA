import {useContext, useEffect, useState} from "react";
import {useDebounce} from "use-debounce";
import {toast} from "sonner";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@radix-ui/react-dropdown-menu";
import {Input} from "@/components/ui/input.tsx";
import {RotateCw, Upload} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import AptForm, {type AptFormSchema} from "@/pages/apartment/action-form-apt.tsx";
import type {bdItemCheckbox} from "@/types/Building.ts";
import {getAllBdAPI} from "@/apis/bdAPI.ts";
import {createAptAPI, createAptUseFileAPI, getApartmentByBuilding, updateAptAPI} from "@/apis/aptAPI.ts";
import {DataTable} from "@/layouts/tables/data-table.tsx";
import {ColumnsApt} from "@/layouts/columns/column-tb-apt.tsx";
import type {fillItemApt} from "@/types/Apartment.ts";
import {columnLabelsApt} from "@/utils/column-label.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {findByIdAPI} from "@/apis/orgAPI.ts";
import {ExcelImportDialog} from "@/layouts/excel/ExcelImportDialog.tsx";
import {APARTMENT_TEMPLATE, APARTMENT_VALIDATION_RULES} from "@/layouts/excel/templates/apartment-template.ts";

function Apartment() {
    const [openDialog, setOpenDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState("");

    const [apt, setApt] = useState([]);
    const [aptUpdate, setAptUpdate] = useState({});
    const [action, setAction] = useState("CREATE");
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});

    // excel
    const [importApartmentDialogOpen, setImportApartmentDialogOpen] =
        useState(false);
    const {orgManage} = useContext(AuthContext);

    //Lay tat ca cac phong ban
    useEffect(() => {
        getAllBuilding()
    }, [])

    const getAllBuilding = async () => {
        try {
            let data = await getAllBdAPI()

            if (orgManage) {
                // Lọc toà nhà theo orgManage
                const bdByOrg = await findByIdAPI(orgManage);
                data = data.filter(item => bdByOrg.building.includes(item.id));
            }

            const items = data.map(function (item: bdItemCheckbox) {
                return ({
                    value: item.id,
                    label: item.buildingName,
                });
            });
            setBuildings(items);
        } catch (err) {
            console.log(err);
        }
    }

    const handleSelectApt = async (value: string) => {
        try {
            setSelectedBuilding(value);
            const data = await getApartmentByBuilding(value)
            setApt(data);
        } catch (err) {
            console.log(err);
        }
    }

    // xu ly khi nhan nut them moi
    const handleCreate = () => {
        setAptUpdate({})
        getAllBuilding() // lay tat ca building de fill vao form
        setAction("CREATE")
        setOpenDialog(true)
    }

    // xu ly khi nhan nut sua
    const handleUpdate = (aptUpdate: fillItemApt): void => { // nhan tham so la thong tin hang can update
        setAptUpdate(aptUpdate)
        getAllBuilding()
        setAction("UPDATE")
        setOpenDialog(true)
    }

    const handleDelete = async (listApt: string[]): void => { // nhan tham so la thong tin hang can update
        console.log(selectedBuilding)
        // await deleteOrgAPI(listOrg)
        // const orgs = await getAllOrgAPI();
        // setOrg(orgs);
        // setRowSelection({})
    }

    //submit form
    const submitCreateOrUpdate = async (data: AptFormSchema, aptId: string) => {
        setLoading(true);
        try {
            if (action === "CREATE") {
                await createAptAPI(data);
            } else {
                await updateAptAPI(data, aptId);
                const apts = await getApartmentByBuilding(selectedBuilding);
                setApt(apts);
            }
            toast.success(action == "CREATE" ? "Thêm mới thành công!" : "Cập nhật thông tin thành công!")
        } catch (err) {
            // console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const handleImportApt = async (file: File) => {
        try {
            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append("files", file);

            // Call API - GỬI FILE
            await createAptUseFileAPI(formData);
            toast.success("Nhập dữ liệu căn hộ thành công!");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-2 md:flex-row">
                <Button className="hover: cursor-pointer" onClick={handleCreate}>Thêm mới</Button>
                <Button className="gap-2 bg-green-800 hover:bg-green-900"
                        onClick={() => setImportApartmentDialogOpen(true)}>
                    <Upload className="h-4 w-4"/>
                    Nhập Excel
                </Button>
                <AptForm open={openDialog}
                         setOpen={setOpenDialog}
                         loading={loading}
                         action={action}
                         formData={aptUpdate}
                         items={buildings}
                         onSubmit={submitCreateOrUpdate}>
                </AptForm>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between  md:flex-row">
                <div>
                    <Select onValueChange={handleSelectApt}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tòa nhà"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Tòa nhà</SelectLabel>
                                {buildings.map((bd: any) => (
                                    <SelectItem key={bd.value} value={bd.value}>
                                        {bd.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center grow justify-end gap-2">
                    <Label>Thu gọn</Label>
                    <Input type="text" placeholder="Nhập từ khóa tìm kiếm" value={keyword}
                           onChange={e => setKeyword(e.target.value)} className="w-1/5"/>
                    <RotateCw className="hover: cursor-pointer" onClick={() => setKeyword("")}/>
                </div>
            </div>

            <div className="p-4 mt-4 border border-gray-300 rounded-xl">
                <DataTable columns={ColumnsApt({handleUpdate, handleDelete})} columnLabels={columnLabelsApt} data={apt}
                           keyword={debouncedKeyword} rowSelection={rowSelection} setRowSelection={setRowSelection}
                           handleDelete={handleDelete}/>
            </div>

            <ExcelImportDialog
                open={importApartmentDialogOpen}
                onOpenChange={setImportApartmentDialogOpen}
                template={APARTMENT_TEMPLATE}
                validationRules={APARTMENT_VALIDATION_RULES}
                duplicateFields={[]}
                onImport={handleImportApt}
                title="Nhập danh sách căn hộ"
                description="Tải file mẫu để nhập thông tin căn hộ"
            />
        </>
    )
}

export default Apartment;
