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
import type {fillItemBd} from "@/types/Building.ts";


// Định nghĩa schema Zod
const schema = z.object({
    buildingName: z.string().min(1, "Tên tòa nhà không được để trống"),
    complexId: z.string().optional(),
})

export type BdFormSchema = z.infer<typeof schema>

type ComponentProps = {
    action: string
    formData: fillItemBd // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
    onSubmit: (data: BdFormSchema, bdId: string) => void
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
}

export default function BdForm({open, setOpen, loading, action, formData, onSubmit}: ComponentProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<BdFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            buildingName: formData?.buildingName || "",
        },
    })

    useEffect(() => {
        if (formData) {
            reset({
                buildingName: formData?.buildingName || "",
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
                            {action === "CREATE" ? "Thêm mới tòa nhà" : "Cập nhật thông tin tòa nhà"}
                        </SheetTitle>
                        <SheetDescription>
                            {action === "CREATE"
                                ? "Nhập thông tin tòa nhà mới. Nhấn nút lưu để hoàn thành việc thêm mới."
                                : "Cập nhật thông tin tòa nhà. Nhấn nút lưu để hoàn thành việc cập nhật"}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="buildingName">Tên tòa nhà</Label>
                                <Input id="buildingName" {...register("buildingName", {
                                    setValueAs: (value) => value?.trim()})} />
                                {errors.buildingName &&
                                    <p className="text-sm text-red-500">{errors.buildingName.message}</p>}
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
