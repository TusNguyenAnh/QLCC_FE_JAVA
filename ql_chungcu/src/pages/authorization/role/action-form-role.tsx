import {useEffect} from 'react'
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Loader2} from 'lucide-react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet.tsx";
import type {RoleItem} from "@/types/Role.ts";


// Định nghĩa schema Zod
const schema = z.object({
    roleName: z.string().min(1, "Tên vai trò không được để trống"),
    description: z.string().optional(),
    complexId: z.string().optional(),
})

export type RoleFormSchema = z.infer<typeof schema>

type ComponentProps = {
    action: string
    formData: RoleItem | null | any// bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
    onSubmit: (data: RoleFormSchema, roleId: string) => void
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
}

export default function RoleForm({open, setOpen, loading, action, formData, onSubmit}: ComponentProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<RoleFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleName: formData?.roleName || "",
            description: formData?.description || "",
            complexId: formData?.complexId || "",
        },
    })

    useEffect(() => {
        if (formData) {
            reset({
                roleName: formData?.roleName || "",
                description: formData?.description || "",
                complexId: formData?.complexId || "",
            })
        }
    }, [formData, reset])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="sm:max-w-[425px] flex flex-col">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>Loading...
                    </div>
                )}

                <form className="flex flex-col flex-1 relative"
                      onSubmit={handleSubmit((data) => {
                          // Gửi ngược data + id lên cha
                          onSubmit(data, formData?.id)
                      })}>
                    <SheetHeader>
                        <SheetTitle>
                            {action === "CREATE" ? "Thêm mới vai trò" : "Cập nhật thông tin vai trò"}
                        </SheetTitle>
                        <SheetDescription>
                            {action === "CREATE"
                                ? "Nhập thông tin vai trò mới. Nhấn nút lưu để hoàn thành việc thêm mới."
                                : "Cập nhật thông tin vai trò. Nhấn nút lưu để hoàn thành việc cập nhật"}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="building_name">Tên vai trò</Label>
                                <Input id="roleName" {...register("roleName", {
                                    setValueAs: (value) => value?.trim()})} />
                                {errors.roleName &&
                                    <p className="text-sm text-red-500">{errors.roleName.message}</p>}

                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="description">Mô tả</Label>
                                <Input id="description" {...register("description", {
                                    setValueAs: (value) => value?.trim()})} />
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="mt-4 absolute bottom-1 w-full">
                        <Button type="submit">Lưu thay đổi</Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline" onClick={() => {
                            }}>Hủy</Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>

        </Sheet>
    )
}
