import {useEffect} from 'react'
import {useForm, Controller} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"

import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Loader2, Lock} from 'lucide-react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet.tsx";

import {Checkbox} from "@/components/ui/checkbox.tsx";
import type {psModule} from "@/types/Permission.ts";

// Định nghĩa schema Zod
const schema = z.object({
    permission: z.array(z.string()).optional(),
    roleId: z.string(),
})

export type AssignPermissionFormSchema = z.infer<typeof schema>

type ComponentProps = {
    roleId: string,
    roleName: string,
    itemsPermission: any[]
    permissionOfRole: string[]
    onSubmit: (data: AssignPermissionFormSchema) => void,
    open?: boolean,
    setOpen?: (open: boolean) => void,
    loading?: boolean,
}

export default function AssignPermissionForm({
                                                 open,
                                                 setOpen,
                                                 loading,
                                                 onSubmit,
                                                 itemsPermission,
                                                 permissionOfRole,
                                                 roleId,
                                                 roleName,
                                             }: ComponentProps) {
    const {
        handleSubmit,
        control,
        reset,
    } = useForm<AssignPermissionFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            permission: [] as string[],
            roleId: roleId
        },
    })

    useEffect(() => {
        if (permissionOfRole) {
            reset({
                permission: permissionOfRole || [],
                roleId: roleId || ""
            })
        }

        console.log(permissionOfRole)
    }, [permissionOfRole, roleId, reset])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="sm:max-w-[625px] flex flex-col">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>Loading...
                    </div>
                )}

                <form className="flex flex-col flex-1 relative"
                      onSubmit={handleSubmit((data) => {
                          onSubmit(data)
                      })}>
                    <SheetHeader>
                        <SheetTitle>
                            {roleName}
                        </SheetTitle>
                        <SheetDescription>
                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Lock className="h-4 w-4"/>
                                Quyền hạn
                            </span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
                        <div className="space-y-4">
                            {itemsPermission.map((itemPs: psModule) => (
                                <div key={itemPs.moduleName} className="space-y-2">
                                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">{itemPs.moduleName}</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {itemPs.permission.map((perm) => (
                                            <Controller
                                                key={perm.id}
                                                control={control}
                                                name="permission"
                                                render={({field}) => {
                                                    const checked = !!field.value?.includes(
                                                        perm.id
                                                    )

                                                    return (
                                                        <Label
                                                            htmlFor={perm.id}
                                                            className="flex items-center space-x-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                                                            <Checkbox
                                                                id={perm.id}
                                                                checked={checked}
                                                                onCheckedChange={(isChecked) => {
                                                                    // clone mảng hiện tại
                                                                    const current = field.value || []
                                                                    let updated: string[]

                                                                    if (isChecked) {
                                                                        updated = [...current, perm.id]
                                                                    } else {
                                                                        updated = current.filter((v) => v !== perm.id)
                                                                    }

                                                                    field.onChange(updated)
                                                                }}
                                                            />
                                                            <span
                                                                className="flex-1 cursor-pointer">{perm.description}</span>
                                                        </Label>
                                                    )
                                                }}
                                            />))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SheetFooter className="mt-4 absolute bottom-1 w-full">
                        <Button type="submit">Lưu thay đổi</Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline" onClick={() => {
                            }}>Hủy
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>

        </Sheet>
    )
}
