"use client"

import {useContext, useEffect, useState} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Plus, Trash2, Edit2, Users, Lock, UserPlus} from "lucide-react"
import type {RoleItem} from "@/types/Role.ts";
import {countPermissionByRoleAPI, countUserByRoleAPI, createRoleAPI, getAllRoleAPI} from "@/apis/roleAPI.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {useDebounce} from "use-debounce";
import RoleForm, {type RoleFormSchema} from "@/pages/authorization/role/action-form-role.tsx";
import {toast} from "sonner";
import AssignPermissionForm, {type AssignPermissionFormSchema} from "@/pages/authorization/role/assign-permission.tsx";
import {assignPermissionAPI, getAllPermissionAPI} from "@/apis/permissAPI.ts";
import type {psItem, psModule} from "@/types/Permission.ts";


export function RoleManagement() {
    const [roles, setRoles] = useState<RoleItem[]>([])
    const [permissions, setPermissions] = useState<psModule[]>([])

    const [filteredRoles, setFilteredRoles] = useState<RoleItem[]>([])

    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogPermission, setOpenDialogPermission] = useState(false);

    const [action, setAction] = useState("CREATE");
    const [roleUpdate, setRoleUpdate] = useState<RoleItem | object>({})
    const [roleId, setRoleId] = useState("");
    const [roleName, setRoleName] = useState("");

    const [permissionOfRole, setPermissionOfRole] = useState<string[]>([])

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 500); // ⏱️ Chờ 500ms sau mỗi lần gõ
    const {complex} = useContext(AuthContext);

    const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null)

    useEffect(() => {
        getAllRole(complex);
        getAllPermission()
    }, [])

    useEffect(() => {
        setFilteredRoles(filteredRole(debouncedKeyword, roles))
    }, [debouncedKeyword, roles]);

    const getAllRole = async (complexId: string) => {
        setLoading(true);
        try {
            const data = await getAllRoleAPI(complexId)
            const countUserByRole: Record<string, number> = await countUserByRoleAPI();


            const result = data.map(role => ({
                id: role.id,
                roleName: role.roleName,
                description: role.description,
                complexId: role.complexId,
                permission: role.rolePermissions.flatMap(
                    item => item.permission[0].id
                ),
                totalUser: countUserByRole[role.id] || 0,
                totalPermission: role.rolePermissions.length || 0,
            }));
            console.log(result)
            setRoles(result)
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredRole = (debouncedKeyword: string, roles: RoleItem[]) => {
        return roles.filter(
            (role) =>
                role.roleName.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
                role.description.toLowerCase().includes(debouncedKeyword.toLowerCase()))
    }

    const getAllPermission = async () => {
        try {
            const data = await getAllPermissionAPI()
            const transformed: psModule[] = Object.entries(data).map(([key, value]) => ({
                moduleName: key,
                permission: (value as psItem[]).map(({id, description}) => ({id, description})),
            }));
            setPermissions(transformed)
            console.log(transformed)
        } catch (err) {
            console.log(err);
        }
    }

    const handleCreate = () => {
        setRoleUpdate({complex_id: complex})
        setAction("CREATE")
        setOpenDialog(true)
    }

    const handleUpdate = (roleUpdate: RoleItem): void => { // nhan tham so la thong tin hang can update
        setRoleUpdate(roleUpdate)
        setAction("UPDATE")
        setOpenDialog(true)
    }

    const handleDelete = (id: string) => {
        setRoles(roles.filter((role) => role.id !== id))
        setSelectedRole(null)
    }

    const handleAssignPermission = (roleUpdate: RoleItem) => {
        setRoleId(roleUpdate.id)
        setRoleName(roleUpdate.roleName)
        setPermissionOfRole(roleUpdate.permission)
        setOpenDialogPermission(true)
    }

    //submit form
    const submitCreateOrUpdate = async (data: RoleFormSchema, roleId: string) => {
        setLoading(true);
        try {
            if (action === "CREATE") {
                await createRoleAPI(data);
            } else {
                console.log(data, roleId)
                // await updateOrgAPI(data, orgId);
            }
            getAllRole(complex)
            toast.success(action == "CREATE" ? "Thêm mới thành công!" : "Cập nhật thông tin thành công!")
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const assignPermission = async (data: AssignPermissionFormSchema) => {
        setLoading(true);
        try {
            console.log(data)
            await assignPermissionAPI(data)
            getAllRole(complex)
            toast.success("Cập nhật quyền cho vai trò thành công!")
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm vai trò..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Button className="w-full gap-2 sm:w-auto" onClick={handleCreate}>
                        <Plus className="h-4 w-4"/>
                        Vai trò mới
                    </Button>

                    <RoleForm
                        action={action}
                        formData={roleUpdate}
                        onSubmit={submitCreateOrUpdate}
                        open={openDialog}
                        setOpen={setOpenDialog}
                        loading={loading}
                    >
                    </RoleForm>

                    <AssignPermissionForm
                        roleId={roleId}
                        roleName={roleName}
                        permissionOfRole={permissionOfRole}
                        itemsPermission={permissions}
                        onSubmit={assignPermission}
                        open={openDialogPermission}
                        setOpen={setOpenDialogPermission}
                        loading={loading}
                    >
                    </AssignPermissionForm>
                </div>

                {/* Search */}

                <div className="space-y-3">
                    {filteredRoles.map((role, index) => (
                        <div
                            key={role.id}
                            className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-4">
                                {/* Left Section - Role Info */}
                                <div className="flex flex-1 items-center gap-4">
                                    {/* Role Level Indicator */}
                                    <div
                                        className={`hidden h-12 w-12 rounded-lg bg-slate-800 flex-shrink-0 items-center justify-center text-white sm:flex`}
                                    >
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    </div>

                                    {/* Role Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground">{role.roleName}</h3>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-muted-foreground">{role.description}</p>
                                    </div>
                                </div>

                                {/* Middle Section - Stats (Hidden on mobile) */}
                                <div className="hidden flex-shrink-0 gap-6 md:flex">
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Quyền hạn</p>
                                        <p className="text-lg font-semibold text-foreground">{role.totalPermission}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Người dùng</p>
                                        <p className="text-lg font-semibold text-foreground">{role.totalUser}</p>
                                    </div>
                                </div>

                                {/* Right Section - Actions */}
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <div
                                        className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUpdate(role)
                                                }}
                                        >
                                            <Edit2 className="h-4 w-4"/>
                                        </Button>

                                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleAssignPermission(role)
                                                }}>
                                            <UserPlus className="h-4 w-4"/>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-10 w-10 p-0 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(role.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Stats */}
                            <div className="mt-3 flex gap-4 md:hidden">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground"/>
                                    <span
                                        className="text-sm text-muted-foreground">{role.totalPermission} quyền</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground"/>
                                    <span
                                        className="text-sm text-muted-foreground">{role.totalUser} người</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRoles.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground">Không tìm thấy vai trò nào</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    )
}
