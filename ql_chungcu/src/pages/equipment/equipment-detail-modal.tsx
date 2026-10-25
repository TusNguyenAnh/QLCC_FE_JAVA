import React, {useEffect, useState} from "react";
import {
    Calendar,
    FileText,
    ShieldCheck,
    Wrench,

} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import type {EquipmentResponse} from "@/types/Equipment.ts";
import {getEquipmentByIdAPI} from "@/apis/equipmentAPI.ts";
import {getCategoryInfo} from "./equipment-constants.ts";

interface EquipmentDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipmentId: string | null;
    initialData?: EquipmentResponse | null;
    onEdit: (item: EquipmentResponse) => void;
    onViewHistory: (item: EquipmentResponse) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
                                                                              open,
                                                                              onOpenChange,
                                                                              equipmentId,
                                                                              initialData,
                                                                          }) => {
    const [equipment, setEquipment] = useState<EquipmentResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !equipmentId) {
            setEquipment(null);
            return;
        }

        // Prefill with initialData while fetching the freshest record
        if (initialData && initialData.id === equipmentId) {
            setEquipment(initialData);
        }

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await getEquipmentByIdAPI(equipmentId);
                if (res) {
                    setEquipment(res);
                }
            } catch {
                // If API fails, fall back to initialData if available
                if (initialData) setEquipment(initialData);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [open, equipmentId, initialData]);

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
    const calculateAge = (dateStr?: string | null) => {
        if (!dateStr) return null;
        try {
            const start = new Date(dateStr);
            if (isNaN(start.getTime())) return null;
            const now = new Date();
            const diffYears = now.getFullYear() - start.getFullYear();
            const diffMonths = now.getMonth() - start.getMonth();
            const totalMonths = diffYears * 12 + diffMonths;

            if (totalMonths <= 0) return "Mới đưa vào vận hành";
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;

            if (years > 0 && months > 0) return `${years} năm ${months} tháng`;
            if (years > 0) return `${years} năm`;
            return `${months} tháng`;
        } catch {
            return null;
        }
    };

    const categoryInfo = getCategoryInfo(equipment?.category);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] p-6 max-h-[90vh] overflow-y-auto gap-1">
                <DialogHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Wrench className="h-5 w-5"/>
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold text-slate-900">
                                    Chi tiết thiết bị
                                </DialogTitle>
                                <p className="text-xs text-slate-500">
                                    Thông số và lịch trình quản lý thiết bị
                                </p>
                            </div>
                        </div>
                        {equipment && (
                            <Badge
                                variant="outline"
                                className={`text-xs font-normal border ${categoryInfo.badgeClass}`}
                            >
                                {categoryInfo.label}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {loading && !equipment ? (
                    <div className="space-y-4 py-4">
                        <Skeleton className="h-6 w-3/4 rounded"/>
                        <Skeleton className="h-20 w-full rounded-lg"/>
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-12 w-full rounded"/>
                            <Skeleton className="h-12 w-full rounded"/>
                        </div>
                    </div>
                ) : equipment ? (
                    <div className="space-y-4 py-2 text-xs">
                        {/* Title Card */}
                        <div className="flex items-center gap-2 mb-2">
                                <span
                                    className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                                    {equipment.equipmentCode}
                                </span>
                            <h3 className="text-base font-bold text-slate-900">
                                {equipment.equipmentName}
                            </h3>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-2xs space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-blue-500"/>
                                    <span>Ngày đưa vào vận hành</span>
                                </div>
                                <div className="text-sm font-semibold text-slate-800 pl-5">
                                    {formatDate(equipment.operationDate)}
                                </div>
                                {calculateAge(equipment.operationDate) && (
                                    <div className="text-[11px] text-slate-400 pl-5">
                                        Thời gian sử dụng: {calculateAge(equipment.operationDate)}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-2xs space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500"/>
                                    <span>Phân loại hạng mục</span>
                                </div>
                                <div className="text-sm font-semibold text-slate-800 pl-5">
                                    {categoryInfo.label}
                                </div>
                                <div className="text-[11px] text-slate-400 pl-5">
                                    {categoryInfo.description || "Hạng mục thiết bị kỹ thuật"}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-2xs space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                <FileText className="h-3.5 w-3.5 text-slate-400"/>
                                <span>Ghi chú & Mô tả kỹ thuật</span>
                            </div>
                            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-5">
                                {equipment.description || "Chưa có mô tả hay thông số chi tiết cho thiết bị này."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-500 text-xs">
                        Không thể tải thông tin thiết bị.
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer text-xs h-8"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
