import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Search } from "lucide-react";
import type { Building } from "@/types/Building.ts";
import type { ExpenseType } from "@/types/Expense.ts";

// =====================================================
// Schema – phản ánh ExpenseFilterRequest (phía BE)
// pageNumber/pageSize do component cha quản lý
// =====================================================

const filterSchema = z.object({
    category: z.string().optional(),
    proposedFrom: z.string().optional(),
    proposedTo: z.string().optional(),
    /** Chỉ dùng khi tab = 'toa'; tab 'cum' thì FE tự lấy toàn bộ tòa */
    buildingId: z.string().optional(),
});

export type FilterExpenseSchema = z.infer<typeof filterSchema>;

// --------------------------------------------------
// Props
// --------------------------------------------------

interface FilterExpenseFormProps {
    /** Loại hình khoản chi để quyết định hiển thị bộ lọc tòa hay không */
    type: ExpenseType;
    /** Danh sách tòa nhà trong cụm (chỉ dùng khi type = 'toa') */
    buildings?: Building[];
    onSubmit: (filters: FilterExpenseSchema) => void;
    onReset?: () => void;
}

// --------------------------------------------------
// Hằng số danh mục
// --------------------------------------------------

const EXPENSE_CATEGORY_OPTIONS = [
    { value: "BAO_DUONG", label: "Chi bảo trì, bảo dưỡng" },
    { value: "SUA_CHUA", label: "Chi thay thế, sửa chữa" },
] as const;

// --------------------------------------------------
// Component
// --------------------------------------------------

export function FilterExpenseForm({
    type,
    buildings = [],
    onSubmit,
    onReset,
}: FilterExpenseFormProps) {
    const defaultBuildingId =
        type === "toa" && buildings.length > 0 ? String(buildings[0].id) : undefined;

    const form = useForm<FilterExpenseSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            category: "all",
            proposedFrom: "",
            proposedTo: "",
            buildingId: defaultBuildingId,
        },
    });

    // Khi danh sách tòa nhà sẵn sàng, tự động gán tòa đầu tiên nếu chưa có
    useEffect(() => {
        if (type === "toa" && buildings.length > 0) {
            const current = form.getValues("buildingId");
            if (!current || current === "all" || !buildings.some((b) => String(b.id) === current)) {
                form.setValue("buildingId", String(buildings[0].id));
            }
        }
    }, [buildings, type, form]);

    const handleReset = () => {
        form.reset({
            category: "all",
            proposedFrom: "",
            proposedTo: "",
            buildingId: defaultBuildingId,
        });
        onReset?.();
    };

    // Phát hiện có filter đang active để hiển thị nút Đặt lại
    const watched = form.watch();
    const hasActiveFilters =
        (watched.category && watched.category !== "all") ||
        (type === "toa" && watched.buildingId && watched.buildingId !== defaultBuildingId) ||
        watched.proposedFrom ||
        watched.proposedTo;

    return (
        <Card className="mb-2 border-slate-200 bg-white shadow-sm">
            <CardContent className="p-3">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-wrap items-end gap-2">

                            {/* Dropdown Chọn Tòa – chỉ hiển thị khi tab = 'toa' (không có lựa chọn Tất cả) */}
                            {type === "toa" && (
                                <FormField
                                    control={form.control}
                                    name="buildingId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1 min-w-[140px]">
                                            <FormLabel className="text-[12px] font-medium text-gray-700">
                                                Tòa nhà
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-xs w-full">
                                                        <SelectValue placeholder="Chọn tòa nhà" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {buildings.map((building) => (
                                                        <SelectItem
                                                            key={building.id}
                                                            value={String(building.id)}
                                                        >
                                                            {building.buildingName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Dropdown Danh mục */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[180px]">
                                        <FormLabel className="text-[12px] font-medium text-gray-700">
                                            Danh mục
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-xs w-full">
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả danh mục</SelectItem>
                                                {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Từ ngày */}
                            <FormField
                                control={form.control}
                                name="proposedFrom"
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[130px]">
                                        <FormLabel className="text-[12px] font-medium text-gray-700">
                                            Từ ngày
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="h-8 text-xs w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Đến ngày */}
                            <FormField
                                control={form.control}
                                name="proposedTo"
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[130px]">
                                        <FormLabel className="text-[12px] font-medium text-gray-700">
                                            Đến ngày
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="h-8 text-xs w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nút hành động */}
                            <div className="flex items-end gap-1.5 ml-auto pb-0.5">
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleReset}
                                        className="h-8 px-2 text-xs gap-1"
                                        title="Đặt lại bộ lọc"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Đặt lại
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-8 px-3 text-xs gap-1"
                                >
                                    <Search className="h-3 w-3" />
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
