import React, {useEffect, useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Loader2, Plus, Check} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import type {
    EquipmentResponse,
    CreateEquipmentPayload,
    UpdateEquipmentPayload,
} from "@/types/Equipment.ts";
import {createEquipmentAPI, updateEquipmentAPI} from "@/apis/equipmentAPI.ts";
import {
    createEquipmentSchema,
    updateEquipmentSchema,
    EQUIPMENT_CATEGORIES,
    type CreateEquipmentFormValues,
    type UpdateEquipmentFormValues,
} from "./equipment-constants.ts";

interface EquipmentFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: EquipmentResponse | null;
    onSuccess: () => void;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
                                                                          open,
                                                                          onOpenChange,
                                                                          editingItem,
                                                                          onSuccess,
                                                                      }) => {
    const isEdit = Boolean(editingItem);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<CreateEquipmentFormValues | UpdateEquipmentFormValues>({
        resolver: zodResolver(isEdit ? updateEquipmentSchema : createEquipmentSchema),
        defaultValues: {
            equipmentCode: "",
            equipmentName: "",
            category: "",
            description: "",
            operationDate: "",
        },
    });

    // Populate or reset form whenever modal opens or editingItem changes
    useEffect(() => {
        if (!open) {
            reset({
                equipmentCode: "",
                equipmentName: "",
                category: "",
                description: "",
                operationDate: "",
            });
            return;
        }

        if (editingItem) {
            let formattedOpDate = "";
            if (editingItem.operationDate) {
                try {
                    const d = new Date(editingItem.operationDate);
                    if (!isNaN(d.getTime())) {
                        formattedOpDate = d.toISOString().split("T")[0];
                    }
                } catch {
                    formattedOpDate = "";
                }
            }

            reset({
                equipmentCode: editingItem.equipmentCode || "",
                equipmentName: editingItem.equipmentName || "",
                category: editingItem.category || "",
                description: editingItem.description || "",
                operationDate: formattedOpDate,
            });
        } else {
            reset({
                equipmentCode: "",
                equipmentName: "",
                category: "",
                description: "",
                operationDate: new Date().toISOString().split("T")[0],
            });
        }
    }, [open, editingItem, reset]);

    const onSubmit = async (values: CreateEquipmentFormValues | UpdateEquipmentFormValues) => {
        setSubmitting(true);
        try {
            if (isEdit && editingItem) {
                const payload: UpdateEquipmentPayload = {
                    equipmentCode: values.equipmentCode.trim(),
                    equipmentName: values.equipmentName.trim(),
                    category: values.category.trim(),
                    description: values.description?.trim() || undefined,
                };
                await updateEquipmentAPI(editingItem.id, payload);
                toast.success("Cập nhật thông tin thiết bị thành công!");
            } else {
                let isoOpDate: string | undefined = undefined;
                if ("operationDate" in values && values.operationDate) {
                    try {
                        isoOpDate = new Date(values.operationDate).toISOString();
                    } catch {
                        isoOpDate = undefined;
                    }
                }

                const payload: CreateEquipmentPayload = {
                    equipmentCode: values.equipmentCode.trim(),
                    equipmentName: values.equipmentName.trim(),
                    category: values.category.trim(),
                    operationDate: isoOpDate,
                    description: values.description?.trim() || undefined,
                };
                await createEquipmentAPI(payload);
                toast.success("Thêm mới thiết bị thành công!");
            }

            onOpenChange(false);
            onSuccess();
        } catch {
            // Error notification handled by request interceptor
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-3 border-b border-slate-100">
                    <DialogTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        {isEdit ? "Cập nhật thông tin thiết bị" : "Thêm mới thiết bị"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        {isEdit
                            ? "Chỉnh sửa mã, tên, hạng mục hoặc mô tả của thiết bị này."
                            : "Điền đầy đủ thông tin để ghi nhận thiết bị vào hệ thống quản lý."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    {/* Mã thiết bị & Tên thiết bị */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="equipmentCode" className="text-xs font-medium text-slate-700">
                                Mã thiết bị <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="equipmentCode"
                                {...register("equipmentCode")}
                                placeholder="VD: TM-A-01, MPD-02..."
                                className={`h-9 font-mono text-xs ${
                                    errors.equipmentCode ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                                disabled={submitting}
                            />
                            {errors.equipmentCode && (
                                <p className="text-xs text-red-500">{errors.equipmentCode.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="equipmentName" className="text-xs font-medium text-slate-700">
                                Tên thiết bị <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="equipmentName"
                                {...register("equipmentName")}
                                placeholder="VD: Thang máy Mitshubishi sảnh A..."
                                className={`h-9 text-xs ${
                                    errors.equipmentName ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                                disabled={submitting}
                            />
                            {errors.equipmentName && (
                                <p className="text-xs text-red-500">{errors.equipmentName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Hạng mục */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category" className="w-full text-xs font-medium text-slate-700">
                                Hạng mục thiết bị <span className="text-red-500">*</span>
                            </Label>
                        </div>

                        <Controller
                            name="category"
                            control={control}
                            render={({field}) => (
                                <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    disabled={submitting}
                                >
                                    <SelectTrigger
                                        id="category"
                                        className={`w-full h-9 text-xs bg-white ${
                                            errors.category ? "border-red-500 focus:ring-red-500" : ""
                                        }`}
                                    >
                                        <SelectValue placeholder="Chọn hạng mục thiết bị..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EQUIPMENT_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                                <span className="font-medium">{cat.label}</span>
                                                {cat.description && (
                                                    <span className="text-slate-400 text-[11px] block">
                                                            {cat.description}
                                                        </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && (
                            <p className="text-xs text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Ngày đưa vào vận hành (Chỉ trong CREATE mode theo API Spec) */}
                    {!isEdit && (
                        <div className="space-y-1.5">
                            <Label htmlFor="operationDate" className="text-xs font-medium text-slate-700">
                                Ngày đưa vào vận hành
                            </Label>
                            <Input
                                id="operationDate"
                                type="date"
                                {...register("operationDate")}
                                className="h-9 text-xs"
                                disabled={submitting}
                            />
                            <p className="text-[11px] text-slate-400">
                                Ngày thiết bị bắt đầu hoạt động chính thức tại tòa nhà
                            </p>
                        </div>
                    )}

                    {/* Mô tả / Ghi chú */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-medium text-slate-700">
                            Mô tả / Thông số kỹ thuật / Vị trí lắp đặt
                        </Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Nhập thông số kỹ thuật, vị trí đặt thiết bị, nhà sản xuất, bảo hành..."
                            rows={3}
                            className="text-xs resize-none"
                            disabled={submitting}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                            className="text-xs h-9"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-medium shadow-xs"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>
                                    Đang lưu...
                                </>
                            ) : isEdit ? (
                                <>
                                    <Check className="h-3.5 w-3.5 mr-1.5"/>
                                    Cập nhật thiết bị
                                </>
                            ) : (
                                <>
                                    <Plus className="h-3.5 w-3.5 mr-1.5"/>
                                    Lưu thiết bị
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
