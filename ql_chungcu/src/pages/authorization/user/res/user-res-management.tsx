import {useContext, useEffect, useState} from "react";
import {useDebounce} from "use-debounce";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Filter, RotateCw} from "lucide-react";

import {AuthContext} from "@/context/AuthContext.tsx";
import {getUserByFilterAPI} from "@/apis/userAPI.ts";
import {DataTable} from "@/layouts/tables/data-table.tsx";
import {ColumnsUser} from "@/layouts/columns/column-tb-user.tsx";
import type {Member} from "@/types/User.ts";
import {columnLabelsMem} from "@/utils/column-label.ts";
import AssignRoleForm, {
    type AssignRoleFormSchema,
} from "@/pages/authorization/user/assign-role.tsx";
import {toast} from "sonner";
import {
    assignRoleAPI,
    getAllRoleAPI,
    getRoleByUserAPI,
} from "@/apis/roleAPI.ts";
import type {RoleItem} from "@/types/Role.ts";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import FilterResForm from "@/pages/resident/filter-form-res.tsx";
import type {FilterResUserFormSchema} from "@/pages/authorization/user/res/filter-form-user-res.tsx";

function UserResManagement() {
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});

    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [member, setMember] = useState([]);
    const [userId, setUserId] = useState("");
    const [roleOfUser, setRoleOfUser] = useState<string>("");
    const [showFilter, setShowFilter] = useState(false);

    const {complex} = useContext(AuthContext);

    //Lay tat ca cac phong ban
    useEffect(() => {
        getAllRole(complex);
    }, []);

    const getUserByFilter = async (filterUser: FilterResUserFormSchema) => {
        try {
            const data = await getUserByFilterAPI(filterUser);
            setMember(data);
        } catch (err) {
            console.log(err);
        }
    };

    const getAllRole = async (complexId: string) => {
        setLoading(true);
        try {
            const data = await getAllRoleAPI(complexId);
            setRoles(data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleByUser = async (userId: string) => {
        try {
            const data = await getRoleByUserAPI(userId, "");
            setRoleOfUser(data);
        } catch (err) {
            console.log(err);
        }
    };

    // // xu ly khi nhan nut sua
    const handleUpdate = async (userId: string) => {
        // nhan tham so la thong tin hang can update
        setUserId(userId);
        await getRoleByUser(userId);
        setOpenDialog(true);
    };

    //
    const assignRole = async (data: AssignRoleFormSchema) => {
        setLoading(true);
        try {
            console.log(data);
            await assignRoleAPI(data);
            toast.success("Cập nhật vai trò cho người dùng thành công!");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between md:flex-row">
                <Collapsible
                    open={showFilter}
                    onOpenChange={setShowFilter}
                    className="w-full"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 md:flex-row">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={showFilter ? "default" : "outline"}
                                className="gap-2"
                            >
                                <Filter className="h-4 w-4"/>
                                Bộ lọc
                            </Button>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-64"
                            />
                            <RotateCw
                                className="h-5 w-5 hover:cursor-pointer"
                                onClick={() => setKeyword("")}
                            />
                        </div>
                    </div>

                    <CollapsibleContent className="mt-4">
                        <div
                            className="p-4 border border-gray-300 rounded-xl bg-gray-50 animate-in slide-in-from-top-2 duration-300">
                            <FilterResForm onSubmit={getUserByFilter}/>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="p-4 border border-gray-300 rounded-xl">
                <DataTable<Member, any>
                    columns={ColumnsUser({handleUpdate})}
                    data={member}
                    columnLabels={columnLabelsMem}
                    keyword={debouncedKeyword}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            </div>

            <AssignRoleForm
                user_id={userId}
                itemsRole={roles}
                roleOfUser={roleOfUser}
                onSubmit={assignRole}
                open={openDialog}
                setOpen={setOpenDialog}
                loading={loading}
                org_id={""}
            />
        </>
    );
}

export default UserResManagement;
