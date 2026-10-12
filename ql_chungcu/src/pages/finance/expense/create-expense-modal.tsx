import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createExpenseAPI, computeAllocation } from "@/apis/expenseAPI.ts";
import type {
    ExpenseCategory,
    ExpenseCreateRequest,
    ExpenseDetailRequest,
    ExpenseType,
} from "@/types/Expense.ts";
import type { Building } from "@/types/Building.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

/** Format số thành chuỗi có dấu chấm phân cách hàng nghìn */
function formatNumberInput(value: number | string): string {
    const num = typeof value === "string" ? parseInt(value.replace(/\./g, "")) || 0 : value;
    return num.toLocaleString("vi-VN");
}

/** Parse chuỗi có dấu chấm/phẩy thành số */
function parseNumberInput(raw: string): number {
    return parseInt(raw.replace(/[^\d]/g, "")) || 0;
}

// --------------------------------------------------
// Schema
// --------------------------------------------------

const schema = z.object({
    taskId: z.string().optional(),
    type: z.enum(["cum", "toa"] as const),
    category: z.enum(["BAO_DUONG", "SUA_CHUA"] as const, {
        errorMap: () => ({ message: "Vui lòng chọn hạng mục" }),
    }),
    totalAmount: z.number({ invalid_type_error: "Số tiền không hợp lệ" }).positive("Số tiền phải lớn hơn 0"),
    payDate: z.string().min(1, "Vui lòng chọn ngày thanh toán"),
    description: z.string().max(1000, "Tối đa 1000 ký tự").optional(),
    /** Chỉ dùng khi type = 'toa' */
    singleBuildingId: z.string().optional(),
});

export type CreateExpenseFormValues = z.infer<typeof schema>;

// --------------------------------------------------
// Types nội bộ
// --------------------------------------------------

interface AllocationRow {
    buildingId: string;
    buildingName: string;
    amount: number;
}

// --------------------------------------------------
// Props
// --------------------------------------------------

interface CreateExpenseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    buildings: Building[];
    complexId: string;
    /** taskId được điền sẵn khi mở từ màn hình Xử lý yêu cầu */
    prefillTaskId?: string;
    onSuccess?: () => void;
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function CreateExpenseModal({
    open,
    onOpenChange,
    buildings,
    complexId,
    prefillTaskId,
    onSuccess,
}: CreateExpenseModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [allocations, setAllocations] = useState<AllocationRow[]>([]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateExpenseFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            taskId: prefillTaskId ?? "",
            type: "cum",
            category: undefined,
            totalAmount: 0,
            payDate: "",
            description: "",
            singleBuildingId: "",
        },
    });

    const watchedType = watch("type");
    const watchedTotalAmount = watch("totalAmount");

    // Prefill taskId khi prop thay đổi
    useEffect(() => {
        if (prefillTaskId) setValue("taskId", prefillTaskId);
    }, [prefillTaskId, setValue]);

    // Reset form khi đóng modal
    useEffect(() => {
        if (!open) {
            reset({
                taskId: prefillTaskId ?? "",
                type: "cum",
                category: undefined,
                totalAmount: 0,
                payDate: "",
                description: "",
                singleBuildingId: "",
            });
            setAllocations([]);
        }
    }, [open]);

    // Tính phân bổ tự động khi đổi type = 'cum' hoặc totalAmount thay đổi
    useEffect(() => {
        if (watchedType !== "cum" || !watchedTotalAmount || !buildings.length) {
            setAllocations([]);
            return;
        }
        const computed = computeAllocation(watchedTotalAmount, buildings);
        const rows: AllocationRow[] = computed.map((c) => {
            const bd = buildings.find((b) => String(b.id) === c.buildingId);
            return {
                buildingId: c.buildingId,
                buildingName: bd?.buildingName ?? c.buildingId,
                amount: c.amount,
            };
        });
        setAllocations(rows);
    }, [watchedType, watchedTotalAmount, buildings]);

    // Kiểm tra tổng phân bổ có khớp totalAmount không
    const allocationTotal = allocations.reduce((s, r) => s + r.amount, 0);
    const isAllocationValid =
        watchedType !== "cum" || (allocations.length > 0 && allocationTotal === watchedTotalAmount);

    // Cập nhật 1 dòng phân bổ
    const updateAllocationAmount = (buildingId: string, rawValue: string) => {
        const num = parseNumberInput(rawValue);
        setAllocations((prev) =>
            prev.map((r) => (r.buildingId === buildingId ? { ...r, amount: num } : r))
        );
    };

    // --------------------------------------------------
    // Submit
    // --------------------------------------------------
    const onSubmit = async (data: CreateExpenseFormValues) => {
        // Validate phân bổ
        if (data.type === "cum" && !isAllocationValid) {
            toast.error(
                `Tổng tiền phân bổ (${VND.format(allocationTotal)}) chưa khớp với tổng chi (${VND.format(data.totalAmount)})`,
            );
            return;
        }

        let expenseDetails: ExpenseDetailRequest[];

        if (data.type === "cum") {
            expenseDetails = allocations.map((r) => ({
                buildingId: r.buildingId,
                amount: r.amount,
            }));
        } else {
            if (!data.singleBuildingId) {
                toast.error("Vui lòng chọn tòa nhà chịu chi phí");
                return;
            }
            expenseDetails = [
                {
                    buildingId: data.singleBuildingId,
                    amount: data.totalAmount,
                },
            ];
        }

        let isoPayDate: string;
        try {
            const parsed = new Date(data.payDate);
            isoPayDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : `${data.payDate}:00Z`;
        } catch {
            isoPayDate = `${data.payDate}:00Z`;
        }

        const payload: ExpenseCreateRequest = {
            taskId: data.taskId || prefillTaskId || "",
            type: data.type,
            category: data.category,
            totalAmount: data.totalAmount,
            payDate: isoPayDate,
            description: data.description,
            expenseDetails,
        };

        setSubmitting(true);
        try {
            await createExpenseAPI(payload);
            toast.success("Lập khoản chi thành công!");
            onOpenChange(false);
            onSuccess?.();
        } catch {
            // Lỗi đã được xử lý ở request interceptor (toast từ request.ts)
        } finally {
            setSubmitting(false);
        }
    };

    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Lập khoản chi mới
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Điền đầy đủ thông tin và phân bổ tiền trước khi lưu.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* taskId (ẩn đi) */}
                    <input type="hidden" {...register("taskId")} />

                    {/* Loại hình khoản chi */}
                    <div className="space-y-1">
                        <Label className="text-xs font-medium">
                            Loại hình chi phí <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <div className="flex gap-3">
                                    {(["cum", "toa"] as const).map((t) => (
                                        <label
                                            key={t}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer text-xs transition-colors ${
                                                field.value === t
                                                    ? "border-primary bg-primary/5 text-primary font-semibold"
                                                    : "border-gray-200 text-gray-600"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                value={t}
                                                checked={field.value === t}
                                                onChange={() => field.onChange(t)}
                                                className="accent-primary"
                                            />
                                            {t === "cum" ? "Chi chung Cụm" : "Chi riêng Tòa"}
                                        </label>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    {/* Hạng mục */}
                    <div className="space-y-1">
                        <Label className="text-xs font-medium">
                            Hạng mục <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="category"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Chọn hạng mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BAO_DUONG">Chi bảo trì, bảo dưỡng</SelectItem>
                                        <SelectItem value="SUA_CHUA">Chi thay thế, sửa chữa</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && (
                            <p className="text-xs text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Tổng số tiền */}
                    <div className="space-y-1">
                        <Label htmlFor="totalAmount" className="text-xs font-medium">
                            Tổng số tiền (VNĐ) <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="totalAmount"
                            render={({ field }) => (
                                <Input
                                    id="totalAmount"
                                    className="h-8 text-sm"
                                    placeholder="0"
                                    value={field.value ? formatNumberInput(field.value) : ""}
                                    onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                                />
                            )}
                        />
                        {errors.totalAmount && (
                            <p className="text-xs text-red-500">{errors.totalAmount.message}</p>
                        )}
                    </div>

                    {/* Ngày thanh toán */}
                    <div className="space-y-1">
                        <Label htmlFor="payDate" className="text-xs font-medium">
                            Ngày thanh toán <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="payDate"
                            type="datetime-local"
                            className="h-8 text-xs"
                            {...register("payDate")}
                        />
                        {errors.payDate && (
                            <p className="text-xs text-red-500">{errors.payDate.message}</p>
                        )}
                    </div>

                    {/* Diễn giải */}
                    <div className="space-y-1">
                        <Label htmlFor="description" className="text-xs font-medium">
                            Diễn giải
                        </Label>
                        <textarea
                            id="description"
                            rows={3}
                            maxLength={1000}
                            className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Nhập diễn giải khoản chi (tùy chọn)..."
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* === Trường hợp TÒA: Chọn tòa nhà chịu chi phí === */}
                    {watchedType === "toa" && (
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                Tòa nhà chịu chi phí <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                control={control}
                                name="singleBuildingId"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Chọn tòa nhà" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {buildings.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
                                                    {b.buildingName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    )}

                    {/* === Trường hợp CỤM: Bảng phân bổ tòa nhà === */}
                    {watchedType === "cum" && allocations.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">
                                    Phân bổ tiền cho từng tòa
                                </Label>
                                <span className="text-xs text-gray-400">
                                    Tổng: {VND.format(allocationTotal)}
                                    {" / "}
                                    {VND.format(watchedTotalAmount)}
                                </span>
                            </div>

                            {/* Cảnh báo không khớp */}
                            {!isAllocationValid && (
                                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-600">
                                        Tổng tiền phân bổ ({VND.format(allocationTotal)}) chưa khớp với tổng chi ({VND.format(watchedTotalAmount)}).
                                        Vui lòng điều chỉnh trước khi lưu.
                                    </p>
                                </div>
                            )}

                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">
                                                Tòa nhà
                                            </th>
                                            <th className="px-3 py-2 text-right font-medium text-gray-500 uppercase">
                                                Số tiền (VNĐ)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {allocations.map((row) => (
                                            <tr key={row.buildingId} className="bg-white">
                                                <td className="px-3 py-1.5 text-gray-700">
                                                    {row.buildingName}
                                                </td>
                                                <td className="px-3 py-1.5 text-right">
                                                    <Input
                                                        className="h-7 text-xs text-right w-36 ml-auto"
                                                        value={formatNumberInput(row.amount)}
                                                        onChange={(e) =>
                                                            updateAllocationAmount(row.buildingId, e.target.value)
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting || (watchedType === "cum" && !isAllocationValid && allocations.length > 0)}
                        >
                            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                            Lưu khoản chi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
