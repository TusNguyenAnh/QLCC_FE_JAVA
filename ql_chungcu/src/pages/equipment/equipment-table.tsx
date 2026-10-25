import React from "react";
import {
    Eye,
    Pencil,
    Trash2,
    History,
    Calendar,
    Wrench,
    Plus,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import type { EquipmentResponse } from "@/types/Equipment.ts";
import { getCategoryInfo } from "./equipment-constants.ts";

interface EquipmentTableProps {
    data: EquipmentResponse[];
    isLoading: boolean;
    page: number;
    size: number;
    selectedIds: string[];
    onToggleSelectAll: () => void;
    onToggleSelectRow: (id: string) => void;
    onViewDetail: (item: EquipmentResponse) => void;
    onViewHistory: (item: EquipmentResponse) => void;
    onEdit: (item: EquipmentResponse) => void;
    onDelete: (item: EquipmentResponse) => void;
    onCreateNew: () => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
    data,
    isLoading,
    page,
    size,
    selectedIds,
    onToggleSelectAll,
    onToggleSelectRow,
    onViewDetail,
    onViewHistory,
    onEdit,
    onDelete,
    onCreateNew,
}) => {
    const isAllSelected =
        data.length > 0 && data.every((item) => selectedIds.includes(item.id));
    const isSomeSelected =
        selectedIds.length > 0 && !isAllSelected && data.some((item) => selectedIds.includes(item.id));

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "Chưa cập nhật";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-slate-50">
                                <TableHead className="w-12 text-center">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                            onCheckedChange={onToggleSelectAll}
                                            aria-label="Chọn tất cả thiết bị trên trang hiện tại"
                                        />
                                    </div>
                                </TableHead>
                                <TableHead className="w-14 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    STT
                                </TableHead>
                                <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Mã thiết bị
                                </TableHead>
                                <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Tên thiết bị
                                </TableHead>
                                <TableHead className="w-48 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Hạng mục
                                </TableHead>
                                <TableHead className="w-40 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Ngày vận hành
                                </TableHead>
                                <TableHead className="min-w-[180px] text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Mô tả / Ghi chú
                                </TableHead>
                                <TableHead className="w-36 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Thao tác
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                // Loading skeleton state
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell className="text-center">
                                            <Skeleton className="h-4 w-4 mx-auto rounded" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Skeleton className="h-4 w-6 mx-auto rounded" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-24 rounded" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-44 rounded" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-28 rounded-full" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-24 rounded" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-36 rounded" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                // Meaningful Empty State
                                <TableRow>
                                    <TableCell colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center px-4">
                                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                                                <Wrench className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-800 mb-1">
                                                Chưa có thiết bị nào
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-5">
                                                Không tìm thấy thiết bị nào phù hợp với điều kiện tìm kiếm hoặc dữ liệu chưa được khởi tạo.
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={onCreateNew}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                                            >
                                                <Plus className="h-4 w-4 mr-1.5" />
                                                Thêm thiết bị mới
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // Data rows
                                data.map((item, index) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    const categoryInfo = getCategoryInfo(item.category);
                                    const stt = page * size + index + 1;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            data-state={isSelected ? "selected" : undefined}
                                            className={`transition-colors border-b border-slate-100 hover:bg-slate-50/80 ${
                                                isSelected ? "bg-blue-50/50" : ""
                                            }`}
                                        >
                                            {/* Selection Checkbox */}
                                            <TableCell className="text-center py-3">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onToggleSelectRow(item.id)}
                                                        aria-label={`Chọn thiết bị ${item.equipmentCode}`}
                                                    />
                                                </div>
                                            </TableCell>

                                            {/* STT */}
                                            <TableCell className="text-center text-xs font-medium text-slate-500 py-3">
                                                {stt}
                                            </TableCell>

                                            {/* Mã thiết bị */}
                                            <TableCell className="font-mono text-xs font-semibold text-blue-700 py-3">
                                                <span className="px-2 py-1 rounded-md bg-blue-50/80 border border-blue-100">
                                                    {item.equipmentCode}
                                                </span>
                                            </TableCell>

                                            {/* Tên thiết bị */}
                                            <TableCell className="py-3">
                                                <div className="font-medium text-slate-900 text-sm">
                                                    {item.equipmentName}
                                                </div>
                                            </TableCell>

                                            {/* Hạng mục */}
                                            <TableCell className="py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-normal border ${categoryInfo.badgeClass}`}
                                                >
                                                    {categoryInfo.label}
                                                </Badge>
                                            </TableCell>

                                            {/* Ngày vận hành */}
                                            <TableCell className="py-3 text-xs text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{formatDate(item.operationDate)}</span>
                                                </div>
                                            </TableCell>

                                            {/* Mô tả */}
                                            <TableCell className="py-3 text-xs text-slate-500 max-w-xs truncate">
                                                {item.description ? (
                                                    <span title={item.description}>
                                                        {item.description}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 italic">Không có mô tả</span>
                                                )}
                                            </TableCell>

                                            {/* Thao tác */}
                                            <TableCell className="py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Chi tiết */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onViewDetail(item)}
                                                                className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                                                aria-label={`Xem chi tiết ${item.equipmentName}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xem chi tiết</TooltipContent>
                                                    </Tooltip>

                                                    {/* Lịch sử bảo dưỡng / chi phí */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onViewHistory(item)}
                                                                className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                                                                aria-label={`Xem lịch sử chi phí ${item.equipmentName}`}
                                                            >
                                                                <History className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Lịch sử chi phí & bảo dưỡng</TooltipContent>
                                                    </Tooltip>

                                                    {/* Sửa */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onEdit(item)}
                                                                className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                                                                aria-label={`Chỉnh sửa ${item.equipmentName}`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Chỉnh sửa</TooltipContent>
                                                    </Tooltip>

                                                    {/* Xóa */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onDelete(item)}
                                                                className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                                aria-label={`Xóa thiết bị ${item.equipmentName}`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa thiết bị</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </TooltipProvider>
    );
};
