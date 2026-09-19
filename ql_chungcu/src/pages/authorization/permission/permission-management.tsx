import {useEffect, useState} from "react";
import {useDebounce} from "use-debounce";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {RotateCw} from "lucide-react";

import {DataTable} from "@/layouts/tables/data-table.tsx";
import {columnLabelsPerm} from "@/utils/column-label.ts";
import {getAllPermissionAPI} from "@/apis/permissAPI.ts";
import type {psItem, psModule} from "@/types/Permission.ts";
import {ColumnsPermission} from "@/layouts/columns/column-tb-permission.tsx";
import {countPermissionByRoleAPI, countUserByRoleAPI} from "@/apis/roleAPI.ts";

function PermissionManagement() {
    const [permissions, setPermissions] = useState<psModule[]>([])
    const [permSelected, setPermSelected] = useState<psItem[]>([]);
    const [moduleSelected, setModuleSelected] = useState<psModule | null>(null);

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});

    useEffect(() => {
        getAllPermission();
    }, [])

    //Lay tat ca cac phong ban
    const getAllPermission = async () => {
        try {
            const data = await getAllPermissionAPI()
            const countRoleByPermission: Record<string, number> = await countPermissionByRoleAPI();

            const transformed: psModule[] = Object.entries(data).map(([key, value]) => ({
                moduleName: key,
                permission: (value as psItem[]).map(({id, name, module, description}) => ({
                    id, name, module, description, totalRoles: countRoleByPermission[id] || 0})),
            }));

            setPermissions(transformed)
        } catch (err) {
            console.log(err);
        }
    }

    const handleSelectedModule = (module: psModule): void => { // nhan tham so la thong tin hang can update
        setModuleSelected(module);
        setPermSelected(module.permission)
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-between  md:flex-row">
                <div className="flex items-center grow justify-end gap-2">
                    <Input type="text" placeholder="Nhập từ khóa tìm kiếm" value={keyword}
                           onChange={e => setKeyword(e.target.value)} className="w-full"/>
                    <RotateCw className="hover: cursor-pointer" onClick={() => setKeyword("")}/>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 py-6">
                {permissions?.map((ps: psModule) => (
                    <Button
                        key={ps.moduleName}
                        variant={moduleSelected?.moduleName === ps.moduleName ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectedModule(ps)}
                    >
                        {ps.moduleName}
                    </Button>
                ))}
            </div>

            <div className="p-4 border border-gray-300 rounded-xl">
                <DataTable<psItem, any> columns={ColumnsPermission()}
                                        data={permSelected}
                                        columnLabels={columnLabelsPerm}
                                        keyword={debouncedKeyword}
                                        rowSelection={rowSelection}
                                        setRowSelection={setRowSelection}
                />
            </div>
        </>
    )
}

export default PermissionManagement;
