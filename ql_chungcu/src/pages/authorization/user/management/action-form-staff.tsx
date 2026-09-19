import {useForm, Controller} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Combobox} from "@/components/ui/combobox.tsx";
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
import {useEffect} from "react";


// Định nghĩa schema Zod
const schema = z.object({
    fullname: z.string().min(1, "Tên thành viên BQL không được để trống"),
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    orgId: z.string().optional(),
    roleId: z.string().optional(),
})

export type StaffFormSchema = z.infer<typeof schema>

type ComponentProps = {
    items: any[]
    positions: any[]
    onSubmit: (data: StaffFormSchema) => void
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
    formData: any // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
}

export default function StaffForm({open, setOpen, loading, items, onSubmit, formData, positions}: ComponentProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors},
    } = useForm<StaffFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            fullname: "",
            email: "",
            phoneNumber: "",
            roleId: "",
            orgId: "",
        },
    })

    useEffect(() => {
        if (formData) {
            reset({
                fullname: formData?.fullname || "",
                email: formData?.email || "",
                phoneNumber: formData?.phoneNumber || "",
                roleId: formData?.roleId || "",
                orgId: formData?.building_name || "",
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
                          onSubmit(data)
                      })}>
                    <SheetHeader>
                        <SheetTitle>
                            Cấp tài khoản ban quản lý
                        </SheetTitle>
                        <SheetDescription>
                            Nhập thông tin thành viên BQL. Nhấn nút lưu để hoàn thành việc cấp tài khoản.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="fullname">Họ và tên</Label>
                                <Input id="fullname" {...register("fullname", {
                                    setValueAs: (value) => value?.trim()
                                })} />
                                {errors.fullname &&
                                    <p className="text-sm text-red-500">{errors.fullname.message}</p>}

                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                <Input id="phoneNumber" {...register("phoneNumber")}/>
                                {errors.phoneNumber &&
                                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" {...register("email", {
                                    setValueAs: (value) => value?.trim()
                                })}
                                       type="email"/>
                                {errors.email &&
                                    <p className="text-sm text-red-500">{errors.email.message}</p>}

                            </div>


                            <div className="grid gap-3">
                                <Label htmlFor="roleId">Vị trí</Label>
                                <Controller
                                    control={control}
                                    name="roleId"
                                    render={({field}) => (
                                        <Combobox
                                            items={positions}
                                            onChange={(value) => field.onChange(value)}
                                            itemUpdate={""}
                                        />
                                    )}
                                />
                            </div>


                            <div className="grid gap-3">
                                <Label htmlFor="orgId">Thuộc cấp quản lý</Label>
                                <Controller
                                    control={control}
                                    name="orgId"
                                    render={({field}) => (
                                        <Combobox
                                            items={items}
                                            onChange={(value) => field.onChange(value)}
                                            itemUpdate={""}
                                        />
                                    )}
                                />
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
