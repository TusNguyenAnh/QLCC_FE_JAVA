import React, { useEffect, useState } from "react";
import {
    Calendar,
    Coins,
    History,
    FileSpreadsheet,
    AlertCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import type {
    EquipmentResponse,
    EquipmentHistoryResponse,
} from "@/types/Equipment.ts";
import { getEquipmentHistoryAPI } from "@/apis/equipmentAPI.ts";
import { formatCurrency } from "@/utils/common.ts";
import { getCategoryInfo } from "./equipment-constants.ts";

interface EquipmentHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: EquipmentResponse | null;
}

export const EquipmentHistoryModal: React.FC<EquipmentHistoryModalProps> = ({
    open,
    onOpenChange,
    equipment,
}) => {
    const [historyList, setHistoryList] = useState<EquipmentHistoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const fetchHistory = async (cat?: string) => {
        if (!equipment) return;
        setLoading(true);
        try {
            const res = await getEquipmentHistoryAPI({
                id: equipment.id,
                category: cat && cat !== "all" ? cat : undefined,
            });
            setHistoryList(Array.isArray(res) ? res : []);
        } catch {
            setHistoryList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open || !equipment) {
            setHistoryList([]);
            setCategoryFilter("all");
            return;
        }

        fetchHistory("all");
    }, [open, equipment]);

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val);
        fetchHistory(val);
    };

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

    // Total expense calculation
    const totalAmount = historyList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const categoryInfo = getCategoryInfo(equipment?.category);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[680px] p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold text-slate-900">
                                    Lịch sử chi phí & sửa chữa
                                </DialogTitle>
                                <p className="text-xs text-slate-500">
                                    Nhật ký các đợt phát sinh chi phí, bảo dưỡng, thay thế linh kiện
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {equipment && (
                    <div className="space-y-4 pt-1">
                        {/* Equipment banner */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                                        {equipment.equipmentCode}
                                    </span>
                                    <span className="font-semibold text-slate-900 text-sm">
                                        {equipment.equipmentName}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    Hạng mục: <span className="font-medium text-slate-700">{categoryInfo.label}</span>
                                </div>
                            </div>

                            {/* Category Filter for History */}
                            <div>
                                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                                    <SelectTrigger className="h-8 text-xs bg-white">
                                        <SelectValue placeholder="Lọc theo loại chi phí" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-xs">
                                            Tất cả khoản chi
                                        </SelectItem>
                                        <SelectItem value="BAO_DUONG" className="text-xs">
                                            Bảo dưỡng định kỳ
                                        </SelectItem>
                                        <SelectItem value="SUA_CHUA" className="text-xs">
                                            Sửa chữa sự cố
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/50 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <Coins className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-500 font-medium">
                                        Tổng chi phí tích lũy
                                    </div>
                                    <div className="text-base font-bold text-amber-700">
                                        {formatCurrency(totalAmount)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-500 font-medium">
                                        Số lượt bảo dưỡng / sửa
                                    </div>
                                    <div className="text-base font-bold text-slate-900">
                                        {historyList.length} lượt
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Records Table / Timeline */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
                                <span>Danh sách ghi nhận</span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                    {historyList.length} bản ghi
                                </span>
                            </div>

                            {loading ? (
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-8 w-full rounded" />
                                    <Skeleton className="h-8 w-full rounded" />
                                    <Skeleton className="h-8 w-full rounded" />
                                </div>
                            ) : historyList.length === 0 ? (
                                <div className="py-12 text-center text-slate-500 px-4">
                                    <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                    <div className="text-sm font-medium text-slate-700">
                                        Chưa có lịch sử chi phí nào
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        Thiết bị này chưa phát sinh chi phí bảo dưỡng hoặc sửa chữa nào trong hệ thống.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                                    {historyList.map((item, index) => (
                                        <div
                                            key={`history-${index}`}
                                            className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                        <Calendar className="h-3 w-3 text-slate-400" />
                                                        {formatDate(item.expenseDate)}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-800 leading-snug">
                                                    {item.description || "Chi phí vận hành / bảo dưỡng thiết bị"}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="font-bold text-sm text-red-600">
                                                    {formatCurrency(item.amount)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-xs h-8"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
