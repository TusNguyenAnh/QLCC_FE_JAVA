import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getExpenseDetailAPI } from "@/apis/expenseAPI.ts";
import type { ExpenseDetailItemResponse } from "@/types/Expense.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

function formatVND(amount: number): string {
    return VND.format(amount);
}

// --------------------------------------------------
// Props
// --------------------------------------------------

interface ClusterAllocationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** ID khoản chi Cụm cần xem phân bổ */
    expenseId: string;
    /** ID cụm (từ AuthContext.complex) */
    complexId: string;
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export function ClusterAllocationModal({
    open,
    onOpenChange,
    expenseId,
    complexId,
}: ClusterAllocationModalProps) {
    const [allocations, setAllocations] = useState<ExpenseDetailItemResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !expenseId || !complexId) return;

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const data = await getExpenseDetailAPI(expenseId, complexId);
                const list = Array.isArray(data)
                    ? data
                    : (data as any)?.result ?? (data as any)?.data ?? [];
                setAllocations(Array.isArray(list) ? list : []);
            } catch {
                toast.error("Không thể tải chi tiết phân bổ khoản chi");
                onOpenChange(false);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [open, expenseId, complexId]);

    const totalAmount = allocations.reduce((sum, a) => sum + (a.amount ?? 0), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Chi tiết phân bổ khoản chi
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Số tiền được phân bổ cho từng tòa nhà trong khoản chi cụm này.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Đang tải...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        STT
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tòa nhà
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Số tiền phân bổ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allocations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-3 py-6 text-center text-gray-400 text-xs"
                                        >
                                            Không có dữ liệu phân bổ
                                        </td>
                                    </tr>
                                ) : (
                                    allocations.map((item, index) => (
                                        <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-gray-400 text-xs">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-800">
                                                {/* description = Tên tòa nhà (theo spec) */}
                                                {item.description}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-gray-800">
                                                {formatVND(item.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {allocations.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                                        <td
                                            colSpan={2}
                                            className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase"
                                        >
                                            Tổng phân bổ
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-primary">
                                            {formatVND(totalAmount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
