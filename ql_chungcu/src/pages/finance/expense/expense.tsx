import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import {
    filterExpensesAPI,
    formatExpenseCategory,
} from "@/apis/expenseAPI.ts";
import { getAllBdAPI } from "@/apis/bdAPI.ts";
import type { Building } from "@/types/Building.ts";
import type {
    ExpenseCategory,
    ExpenseFilterRequest,
    ExpenseItemResponse,
    ExpenseType,
} from "@/types/Expense.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AuthContext } from "@/context/AuthContext.tsx";
import { FilterExpenseForm, type FilterExpenseSchema } from "./filter-form-expense.tsx";
import { ClusterAllocationModal } from "./cluster-allocation-modal.tsx";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

function formatVND(amount: number | null | undefined): string {
    if (amount == null) return "-";
    return VND.format(amount);
}

function formatPayDate(iso: string | null | undefined): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// --------------------------------------------------
// Types nội bộ
// --------------------------------------------------

interface FilterState {
    category?: string;
    proposedFrom?: string;
    proposedTo?: string;
    buildingId?: string;
}

const DEFAULT_FILTER: FilterState = {};

// --------------------------------------------------
// Component chính
// --------------------------------------------------

export default function Expense() {
    const { complex } = useContext(AuthContext);

    // Tab state
    const [activeTab, setActiveTab] = useState<ExpenseType>("cum");

    // Danh sách tòa nhà trong cụm
    const [buildings, setBuildings] = useState<Building[]>([]);

    // Danh sách khoản chi
    const [expenses, setExpenses] = useState<ExpenseItemResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Phân trang (pageNumber 0-based cho BE, page 1-based cho UI)
    const [page, setPage] = useState(0); // 0-based
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Bộ lọc đang áp dụng
    const [appliedFilter, setAppliedFilter] = useState<FilterState>(DEFAULT_FILTER);
    const [filterKey, setFilterKey] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Modal xem phân bổ Cụm
    const [allocationModalOpen, setAllocationModalOpen] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

    // --------------------------------------------------
    // Load tòa nhà
    // --------------------------------------------------
    const fetchBuildings = async () => {
        try {
            const data: Building[] = await getAllBdAPI();
            setBuildings(data ?? []);
        } catch {
            toast.error("Không thể tải danh sách tòa nhà");
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    // --------------------------------------------------
    // Build request payload
    // --------------------------------------------------
    const buildFilterRequest = (
        tab: ExpenseType,
        filter: FilterState,
        pageNumber: number,
    ): ExpenseFilterRequest => {
        // Với tab Cụm: gửi toàn bộ ID tòa trong cụm
        // Với tab Tòa: gửi ID tòa được chọn (hoặc tất cả nếu chưa chọn)
        let buildingIds: string[] = [];
        if (tab === "cum") {
            buildingIds = buildings.map((b) => String(b.id));
        } else {
            const chosenId =
                filter.buildingId && filter.buildingId !== "all"
                    ? filter.buildingId
                    : buildings.length > 0
                    ? String(buildings[0].id)
                    : undefined;
            buildingIds = chosenId ? [chosenId] : [];
        }

        const payload: ExpenseFilterRequest = {
            type: tab,
            buildingId: buildingIds,
            pageNumber,
            pageSize,
        };

        if (filter.category && filter.category !== "all") {
            payload.category = [filter.category as ExpenseCategory];
        }
        if (filter.proposedFrom) {
            payload.proposedFrom = `${filter.proposedFrom}T00:00:00`;
        }
        if (filter.proposedTo) {
            payload.proposedTo = `${filter.proposedTo}T23:59:59`;
        }

        return payload;
    };

    // --------------------------------------------------
    // Fetch expenses
    // --------------------------------------------------
    const fetchExpenses = async (
        tab: ExpenseType,
        filter: FilterState,
        pageNumber: number,
    ) => {
        if (!complex) return;
        setLoading(true);
        try {
            const payload = buildFilterRequest(tab, filter, pageNumber);
            const result = await filterExpensesAPI(String(complex), payload);
            const items =
                result?.data ??
                result?.content ??
                (result as any)?.result?.data ??
                (result as any)?.result?.content ??
                [];
            const pages =
                result?.totalPages ??
                (result as any)?.result?.totalPages ??
                0;
            const total =
                result?.totalElements ??
                (result as any)?.result?.totalElements ??
                0;

            setExpenses(Array.isArray(items) ? items : []);
            setTotalPages(pages);
            setTotalElements(total);
        } catch {
            toast.error("Không thể tải danh sách khoản chi");
        } finally {
            setLoading(false);
        }
    };

    // Load lại khi có buildings
    useEffect(() => {
        if (buildings.length > 0) {
            const initialFilter: FilterState =
                activeTab === "toa" && !appliedFilter.buildingId
                    ? { ...appliedFilter, buildingId: String(buildings[0].id) }
                    : appliedFilter;
            setAppliedFilter(initialFilter);
            fetchExpenses(activeTab, initialFilter, 0);
        }
    }, [buildings]);

    // --------------------------------------------------
    // Xử lý đổi Tab
    // --------------------------------------------------
    const handleTabChange = (value: string) => {
        const tab = value as ExpenseType;
        setActiveTab(tab);
        const nextFilter: FilterState =
            tab === "toa" && buildings.length > 0
                ? { buildingId: String(buildings[0].id) }
                : DEFAULT_FILTER;
        setAppliedFilter(nextFilter);
        setFilterKey((k) => k + 1);
        setPage(0);
        fetchExpenses(tab, nextFilter, 0);
    };

    // --------------------------------------------------
    // Xử lý Filter
    // --------------------------------------------------
    const handleFilterSubmit = (filters: FilterExpenseSchema) => {
        const newFilter: FilterState = {
            category: filters.category,
            proposedFrom: filters.proposedFrom,
            proposedTo: filters.proposedTo,
            buildingId: filters.buildingId,
        };
        setAppliedFilter(newFilter);
        setPage(0);
        fetchExpenses(activeTab, newFilter, 0);
    };

    const handleFilterReset = () => {
        const resetFilter: FilterState =
            activeTab === "toa" && buildings.length > 0
                ? { buildingId: String(buildings[0].id) }
                : DEFAULT_FILTER;
        setAppliedFilter(resetFilter);
        setPage(0);
        setFilterKey((k) => k + 1);
        fetchExpenses(activeTab, resetFilter, 0);
    };

    // --------------------------------------------------
    // Phân trang
    // --------------------------------------------------
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchExpenses(activeTab, appliedFilter, newPage);
    };

    // --------------------------------------------------
    // Modal Phân bổ tòa
    // --------------------------------------------------
    const openAllocationModal = (expenseId: string) => {
        setSelectedExpenseId(expenseId);
        setAllocationModalOpen(true);
    };

    // --------------------------------------------------
    // Tìm khoản chi theo danh mục để hiển thị 2 cột tiền
    // --------------------------------------------------
    const getAmountByCategory = (
        expense: ExpenseItemResponse,
        category: ExpenseCategory,
    ): number | null => {
        if (expense.category === category) return expense.amount;
        return null;
    };

    // --------------------------------------------------
    // Render bảng danh sách
    // --------------------------------------------------
    const renderTable = (type: ExpenseType) => (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12">
                                    STT
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Ngày chi
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Diễn giải
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                    Chi bảo trì, bảo dưỡng
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                    Chi thay thế, sửa chữa
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense, index) => {
                                    const baoDuong = getAmountByCategory(expense, "BAO_DUONG");
                                    const suaChua = getAmountByCategory(expense, "SUA_CHUA");
                                    return (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 text-gray-500 text-xs">
                                                {page * pageSize + index + 1}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                {formatPayDate(expense.payDate)}
                                            </td>
                                            <td className="px-3 py-2 max-w-[200px]">
                                                <TooltipProvider delayDuration={200}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="block truncate cursor-default">
                                                                {expense.description || "-"}
                                                            </span>
                                                        </TooltipTrigger>
                                                        {expense.description && (
                                                            <TooltipContent
                                                                side="top"
                                                                className="max-w-xs text-xs"
                                                            >
                                                                {expense.description}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-800">
                                                {baoDuong != null ? formatVND(baoDuong) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-800">
                                                {suaChua != null ? formatVND(suaChua) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {type === "cum" && (
                                                    <TooltipProvider delayDuration={100}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => openAllocationModal(expense.id)}
                                                                    aria-label="Xem phân bổ tòa nhà"
                                                                >
                                                                    <Eye className="h-4 w-4 text-primary" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">
                                                                Xem phân bổ tòa nhà
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang đơn giản */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
                        <span>
                            Trang {page + 1} / {totalPages} &nbsp;|&nbsp; {totalElements} khoản chi
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                disabled={page === 0}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                &lt;
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                disabled={page >= totalPages - 1}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                &gt;
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    return (
        <div className="p-4 space-y-3">
            {/* Tiêu đề */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-800">Quản lý Khoản Chi</h1>
            </div>

            {/* Tabs Cụm / Tòa */}
            <Tabs defaultValue="cum" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 max-w-xs">
                    <TabsTrigger value="cum">Chi phí Cụm</TabsTrigger>
                    <TabsTrigger value="toa">Chi phí Tòa</TabsTrigger>
                </TabsList>

                {/* --- TAB CỤM --- */}
                <TabsContent value="cum" className="space-y-2 mt-2">
                    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-xs mb-2">
                                🔍 Bộ lọc
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <FilterExpenseForm
                                key={`cum-${filterKey}`}
                                type="cum"
                                buildings={buildings}
                                onSubmit={handleFilterSubmit}
                                onReset={handleFilterReset}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                    {renderTable("cum")}
                </TabsContent>

                {/* --- TAB TÒA --- */}
                <TabsContent value="toa" className="space-y-2 mt-2">
                    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-xs mb-2">
                                🔍 Bộ lọc
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <FilterExpenseForm
                                key={`toa-${filterKey}`}
                                type="toa"
                                buildings={buildings}
                                onSubmit={handleFilterSubmit}
                                onReset={handleFilterReset}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                    {renderTable("toa")}
                </TabsContent>
            </Tabs>

            {/* Modal phân bổ tòa nhà (chỉ Tab Cụm) */}
            {selectedExpenseId && complex && (
                <ClusterAllocationModal
                    open={allocationModalOpen}
                    onOpenChange={setAllocationModalOpen}
                    expenseId={selectedExpenseId}
                    complexId={String(complex)}
                />
            )}
        </div>
    );
}
