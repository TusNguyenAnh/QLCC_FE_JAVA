import { useEffect} from "react";
import {useForm, Controller} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Combobox} from "@/components/ui/combobox.tsx";
import {Loader2} from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet.tsx";
import type {fillItemTt} from "@/types/TaskType.ts";

// Định nghĩa schema Zod
const schema = z.object({
    typeName: z.string().min(1, "Tên loại đề xuất không được để trống"),
    description: z.string().optional(),
    workflowId: z.string().optional(),
    priorityId: z.string().optional(),
});

export type TaskTypeFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    action: string;
    formData: fillItemTt; // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
    itemsWf: any[];
    itemsPriority: any[];
    onSubmit: (data: TaskTypeFormSchema) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
};

export default function TaskTypeForm({
                                    open,
                                    setOpen,
                                    loading,
                                    action,
                                    formData,
                                    itemsWf,
                                    itemsPriority,
                                    onSubmit,
                                }: ComponentProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors},
    } = useForm<TaskTypeFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            typeName: formData?.typeName || "",
            description: formData?.description || "",
            workflowId: formData?.workflowId || "",
            priorityId: formData?.priority.id || "",
        },
    });

    useEffect(() => {
        if (formData) {
            reset({
                typeName: formData?.typeName || "",
                description: formData?.description || "",
                workflowId: formData?.workflowId || "",
                priorityId: formData?.priority.id || "",
            });
        }
    }, [formData, reset]);

    // Reset form và danh sách tòa nhà khi đóng popup
    useEffect(() => {
        if (!open) {
            reset({
                typeName: "",
                description: "",
                workflowId: "",
                priorityId: "",
            });
        }
    }, [open, reset]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="sm:max-w-[425px] flex flex-col">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>
                        Loading...
                    </div>
                )}

                <form
                    className="flex flex-col flex-1 relative"
                    onSubmit={handleSubmit((data) => {
                        onSubmit(data);
                    })}
                >
                    <SheetHeader>
                        <SheetTitle>
                            {action === "CREATE"
                                ? "Thêm mới loại yêu cầu"
                                : "Cập nhật thông tin loại yêu cầu"}
                        </SheetTitle>
                        <SheetDescription>
                            {action === "CREATE"
                                ? "Nhập thông tin loại yêu cầu mới. Nhấn nút lưu để hoàn thành việc thêm mới."
                                : "Cập nhật thông tin loại yêu cầu. Nhấn nút lưu để hoàn thành việc cập nhật"}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[70vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="typeName">Tên loại yêu cầu</Label>
                                <Input id="typeName" {...register("typeName", {
                                    setValueAs: (value) => value?.trim()
                                })} />
                                {errors.typeName && (
                                    <p className="text-sm text-red-500">
                                        {errors.typeName.message}
                                    </p>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div className="grid gap-3">
                                <Label htmlFor="description">Mô tả</Label>
                                <Input id="description" {...register("description", {
                                    setValueAs: (value) => value?.trim()
                                })} />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="workflowId">Quy trình</Label>
                                <Controller
                                    control={control}
                                    name="workflowId"
                                    render={({field}) => (
                                        <Combobox
                                            items={itemsWf}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            itemUpdate={
                                                action === "UPDATE" ? formData.workflowId : ""
                                            }
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="priorityId">Mức ưu tiên</Label>
                                <Controller
                                    control={control}
                                    name="priorityId"
                                    render={({field}) => (
                                        <Combobox
                                            items={itemsPriority}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            itemUpdate={
                                                action === "UPDATE" ? formData.priority.id : ""
                                            }
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
                            }}>
                                Hủy
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
