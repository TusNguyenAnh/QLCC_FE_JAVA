import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
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
import {Combobox} from "@/components/ui/combobox.tsx";

// Định nghĩa schema Zod
const schema = z.object({
    taskName: z.string().min(1, "Tên khoản chi không được để trống"),
    description: z.string().optional(),
    tasktypeId: z.string().optional(),
    buildingId: z.array(z.string()).optional(),
    files: z.any().optional(),
});

export type ReqFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    // formData: fillItemBd // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
    onSubmit: (data: ReqFormSchema) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
    itemsBd: any[];
    itemsTt: any[];
};

export default function SendReqForm({
                                        open,
                                        setOpen,
                                        loading,
                                        onSubmit,
                                        itemsTt,
                                        itemsBd,
                                    }: ComponentProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<ReqFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            taskName: "",
            description: "",
            tasktypeId: "",
            buildingId: [],
            files: undefined,
        },
    });

    useEffect(() => {
        reset({
            taskName: "",
            description: "",
            tasktypeId: "",
            buildingId: [],
            files: undefined,
        });
    }, [reset]);

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
                        // Gửi ngược data + id lên cha
                        onSubmit(data);
                    })}
                >
                    <SheetHeader>
                        <SheetTitle>Thêm mới yêu cầu, phản ánh</SheetTitle>
                        <SheetDescription>
                            Nhập thông tin yêu cầu, phản ánh mới. Nhấn nút lưu để hoàn thành
                            việc thêm mới.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[70vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="taskName">Tên yêu cầu, phản ánh</Label>
                                <Input
                                    id="taskName"
                                    {...register("taskName", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                                {errors.taskName && (
                                    <p className="text-sm text-red-500">
                                        {errors.taskName.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="description">Mô tả</Label>
                                <Input
                                    id="description"
                                    {...register("description", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="buildingId">Tòa nhà</Label>
                                <Controller
                                    control={control}
                                    name="buildingId"
                                    render={({field}) => (
                                        <Combobox
                                            items={itemsBd}
                                            onChange={(value) => {
                                                field.onChange([value]);
                                            }}
                                            itemUpdate={""}
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="tasktypeId">Loại yều cầu, phản ánh</Label>
                                <Controller
                                    control={control}
                                    name="tasktypeId"
                                    render={({field}) => (
                                        <Combobox
                                            items={itemsTt}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            itemUpdate={""}
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="files">Tệp đính kèm</Label>
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    {...register("files")}
                                    className="cursor-pointer"
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                />
                                {errors.files && (
                                    <p className="text-sm text-red-500">
                                        {errors.files.message as string}
                                    </p>
                                )}
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
