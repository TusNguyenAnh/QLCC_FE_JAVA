import {useContext, useEffect, useState} from "react";
import {useDebounce} from "use-debounce";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {RotateCw} from "lucide-react";

import {AuthContext} from "@/context/AuthContext.tsx";
import {getAllOrgWithoutChildAPI} from "@/apis/orgAPI.ts";
import type {orgWithoutChild} from "@/types/Organization.ts";
import {findStaffByOrgId} from "@/apis/userAPI.ts";
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
import StaffForm, {type StaffFormSchema} from "@/pages/authorization/user/management/action-form-staff.tsx";
import {createStaffAPI} from "@/apis/staffAPI.ts";

function UserStaffManagement() {
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogStaff, setOpenDialogStaff] = useState(false);
    const [staff, setStaff] = useState({});

    const [loading, setLoading] = useState(false);

    const [roles, setRoles] = useState<RoleItem[]>([]);

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const [rowSelection, setRowSelection] = useState({});
    const [listOrgWithoutChild, setListOrgWithoutChild] = useState<
        { value: string, label: string }[] | []
    >([]);
    const [listPosition, setlistPosition] = useState<
        { value: string, label: string }[] | []
    >([]);

    const [orgSelected, setOrgSelected] = useState("");
    const [member, setMember] = useState<Member[]>([]);
    const [userId, setUserId] = useState("");

    const [roleOfUser, setRoleOfUser] = useState("");

    const {complex} = useContext(AuthContext);

    //Lay tat ca cac phong ban
    useEffect(() => {
        getAllOrgWithoutChild("0", complex);
        // getAllPosition();
        getAllRole(complex);
    }, []);

    useEffect(() => {
        if (!orgSelected) {
            setMember([]);
            return;
        }
    }, []);

    const fetchMembers = async (orgId: string) => {
        setLoading(true);
        try {
            setOrgSelected(orgId);
            const data = await findStaffByOrgId(orgId);
            setMember(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setMember([]);
        } finally {
            setLoading(false);
        }
    };


    //Lay tat ca cac phong ban tru phong ban hien tai va con cua no de fill vao form action
    const getAllOrgWithoutChild = async (orgId: string, complexId: string) => {
        try {
            const data = await getAllOrgWithoutChildAPI(orgId, complexId);
            const items = data.map(function (item: orgWithoutChild) {
                return ({
                    value: item.id,
                    label: item.orgName,
                });
            });
            setListOrgWithoutChild(items);
        } catch (err) {
            console.log(err);
        }
    };

    // const getAllPosition = () => {
    //     const items = Object.entries(POSITION).map(([key, value]) => {
    //         return ({
    //             value: key,
    //             label: value,
    //         });
    //     });
    //     setlistPosition(items);
    // };


    const getAllRole = async (complexId: string) => {
        setLoading(true);
        try {
            const data = await getAllRoleAPI(complexId);
            setRoles(data);
            const items = data.map(function (item: RoleItem) {
                return ({
                    value: item.id,
                    label: item.roleName,
                });
            });
            setlistPosition(items);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleByUser = async (userId: string) => {
        try {
            const data = await getRoleByUserAPI(userId, orgSelected.id);
            setRoleOfUser(data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreate = () => {
        setStaff({});
        setOpenDialogStaff(true);
    };

    const submitCreateAccount = async (data: StaffFormSchema) => {
        setLoading(true);
        try {
            await createStaffAPI(data);
            toast.success("Tạo tài khoản thành viên BQL thành công!")
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    // // xu ly khi nhan nut cap role (khiên)
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
            <div className="flex flex-wrap items-center justify-between  md:flex-row">
                <div className="flex items-center justify-start gap-2">
                    <Input
                        type="text"
                        placeholder="Nhập từ khóa tìm kiếm"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full"
                    />
                    <RotateCw
                        className="hover: cursor-pointer"
                        onClick={() => setKeyword("")}
                    />
                </div>

                <Button className="hover: cursor-pointer" onClick={handleCreate}>
                    Cấp tài khoản quản lý
                </Button>

            </div>
            {listOrgWithoutChild.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {listOrgWithoutChild.map((org: { value: string, label: string }) => (
                        <Button
                            key={org.value}
                            variant={orgSelected === org.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => fetchMembers(org.value)}
                        >
                            {org.label}
                        </Button>
                    ))}
                </div>
            )}

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
                org_id={orgSelected}
            />

            <StaffForm
                open={openDialogStaff}
                setOpen={setOpenDialogStaff}
                loading={loading}
                items={listOrgWithoutChild}
                onSubmit={submitCreateAccount}
                formData={staff}
                positions={listPosition}/>
        </>
    );
}

export default UserStaffManagement;
