import {useEffect} from "react";
import {useForm, Controller} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet.tsx";
import type {fillItemApt} from "@/types/Apartment.ts";

// Định nghĩa schema Zod
const schema = z.object({
    aptNumber: z.string().min(1, "Số căn hộ không được để trống"),
    grossArea: z.number().optional(),
    coefficient: z.number().optional(),
    aptType: z.string().optional(),
    buildingId: z.string().optional(),
    description: z.string().optional(),
    floor: z.number().optional(),
});

export type AptFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    action: string;
    formData: fillItemApt; // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
    items: any[];
    onSubmit: (data: AptFormSchema, aptId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
};

export default function AptForm({
                                    open,
                                    setOpen,
                                    loading,
                                    action,
                                    formData,
                                    items,
                                    onSubmit,
                                }: ComponentProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors},
    } = useForm<AptFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            aptNumber: formData?.aptNumber || "",
            grossArea: formData?.grossArea || 1, // Giả sử diện tích mặc định là 1
            coefficient: formData?.coefficient || 0.1,
            floor: formData?.floor || 1,
            description: formData?.description || "",
            aptType: formData?.aptType || "",
            buildingId: formData?.buildingId || items[0]?.value || "",
        },
    });

    useEffect(() => {
        if (formData) {
            reset({
                aptNumber: formData.aptNumber || "",
                grossArea: formData?.grossArea || 1,
                coefficient: formData?.coefficient || 0.1,
                floor: formData.floor || 1,
                description: formData.description || "",
                aptType: formData?.aptType || "",
                buildingId: formData?.buildingId || items[0]?.value || "",
            });
        }
    }, [formData, reset, items]);

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
                        onSubmit(data, formData?.id);
                    })}
                >
                    <SheetHeader>
                        <SheetTitle>
                            {action === "CREATE"
                                ? "Thêm mới căn hộ"
                                : "Cập nhật thông tin căn hộ"}
                        </SheetTitle>
                        <SheetDescription>
                            {action === "CREATE"
                                ? "Nhập thông tin căn hộ mới. Nhấn nút lưu để hoàn thành việc thêm mới."
                                : "Cập nhật thông tin căn hộ. Nhấn nút lưu để hoàn thành việc cập nhật"}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
                        <div className="grid gap-4">
                            {/* Số căn hộ */}
                            <div className="grid gap-3">
                                <Label htmlFor="aptNumber">Số căn hộ</Label>
                                <Input
                                    id="aptNumber"
                                    {...register("aptNumber", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                                {errors.aptNumber && (
                                    <p className="text-sm text-red-500">
                                        {errors.aptNumber.message}
                                    </p>
                                )}
                            </div>
                            {/* Tầng */}
                            <div className="grid gap-3">
                                <Label htmlFor="floor">Tầng</Label>
                                <Input
                                    id="floor"
                                    {...register("floor", {valueAsNumber: true})}
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="1"
                                />
                                {errors.floor && (
                                    <p className="text-sm text-red-500">{errors.floor.message}</p>
                                )}
                            </div>

                            {/* Diện tích căn hộ */}
                            <div className="grid gap-3">
                                <Label htmlFor="grossArea">
                                    Diện tích tim tường (m
                                    <sup style={{margin: "0 -6px", fontSize: "10px"}}>2</sup>)
                                </Label>
                                <Input
                                    id="grossArea"
                                    {...register("grossArea", {valueAsNumber: true})}
                                    type="number"
                                    min="10"
                                    max="1000"
                                    step="0.01"
                                />
                                {errors.grossArea && (
                                    <p className="text-sm text-red-500">
                                        {errors.grossArea.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="coefficient">
                                    Hệ số quy đổi
                                </Label>
                                <Input
                                    id="coefficient"
                                    {...register("coefficient", {valueAsNumber: true})}
                                    type="number"
                                    min="0,1"
                                    max="100"
                                    step="0.01"
                                />
                                {errors.coefficient && (
                                    <p className="text-sm text-red-500">
                                        {errors.coefficient.message}
                                    </p>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div className="grid gap-3">
                                <Label htmlFor="description">Mô tả</Label>
                                <Input
                                    id="description"
                                    {...register("description", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="aptType">Loại căn hộ</Label>
                                <Input
                                    id="aptType"
                                    {...register("aptType", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                            </div>

                            {action === "CREATE" && (
                                <div className="grid gap-3">
                                    <Label htmlFor="buildingId">Thuộc tòa nhà</Label>
                                    <Controller
                                        control={control}
                                        name="buildingId"
                                        render={({field}) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={items[0]?.value || ""}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Chọn tòa nhà"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {items.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}
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
