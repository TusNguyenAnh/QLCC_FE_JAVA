import {useEffect, useState, useMemo, useContext} from "react";
import {getLedger} from "@/apis/ledgerAPI.ts";
import type {Ledger, LedgerFilters} from "@/types/Ledger.ts";
import type {PaginationMeta} from "@/types/Pagination.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {getAllBdAPI} from "@/apis/bdAPI.ts";
import {DataPagination} from "@/layouts/pagination/data-pagination.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {toast} from "sonner";
import {formatCurrency} from "@/utils/common.ts";
import {
    Loader2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    Calendar,
    Eye,
    PlusCircle,
} from "lucide-react";
import AdjustmentDialog from "@/pages/finance/adjustment/adjustment.tsx";
import ActionFormAdjustment, {
    type AdjustmentFormSchema,
} from "@/pages/finance/adjustment/action-form-adjustment.tsx";
import {createAdjustment} from "@/apis/adjustmentAPI.ts";
import {findByIdAPI} from "@/apis/orgAPI.ts";

export default function CashReport() {
    const {financeModel,orgManage} = useContext(AuthContext);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
    const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
    const [createAdjustmentDialogOpen, setCreateAdjustmentDialogOpen] =
        useState(false);
    const [creatingAdjustment, setCreatingAdjustment] = useState(false);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [buildingId, setBuildingId] = useState<string>("");

    // Pagination state
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 0,
        totalPages: 1,
        size: 10,
        totalElements: 0,
    });
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Filter state - date range
    const [transFrom, setTransFrom] = useState<string>(
        new Date(new Date().setDate(1)).toISOString().split("T")[0]
    );
    const [transTo, setTransTo] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalRevenue = ledgers
            .filter((l) => l.type === "revenue")
            .reduce((sum, l) => sum + parseFloat(String(l.final_amount)), 0);
        const totalExpense = ledgers
            .filter((l) => l.type === "expense")
            .reduce((sum, l) => sum + parseFloat(String(l.final_amount)), 0);
        const balance =
            ledgers.length > 0 ? ledgers[ledgers.length - 1].balance : 0;

        return {
            totalRevenue,
            totalExpense,
            balance,
            totalTransactions: meta.totalElements,
            todayTransactions: ledgers.filter(
                (l) =>
                    new Date(l.transaction_date).toDateString() ===
                    new Date().toDateString()
            ).length,
        };
    }, [ledgers, meta.totalElements]);

    // Fetch ledgers function
    const fetchLedgers = async (
        from: string,
        to: string,
        pageNum = 1,
        pageSize = 10,
        bldId?: string
    ) => {
        try {
            setLoading(true);

            const filters: LedgerFilters = {
                perPage: pageSize,
                page: pageNum,
                payment_method: "cash", // Fixed to cash
                trans_from: from,
                trans_to: to,
            };

            if (bldId) {
                filters.building_id = bldId;
            }

            const response = await getLedger(filters);
            setLedgers(response.result?.data || []);
            setMeta(response.result || {
                page: 0,
                totalPages: 1,
                size: pageSize,
                totalElements: 0,
            });
        } catch (error) {
            console.error("Error fetching ledgers:", error);
            toast.error("Không thể tải danh sách sổ quỹ tiền mặt");
        } finally {
            setLoading(false);
        }
    };

    // Fetch buildings if decentralized
    useEffect(() => {
        const loadBuildings = async () => {
            if (financeModel === "decentralized") {
                try {
                    let data = await getAllBdAPI();
                    if (orgManage) {
                        // Lọc toà nhà theo orgManage
                        const bdByOrg = await findByIdAPI(orgManage);
                        data = data.filter(item => bdByOrg.building.includes(item.id));
                    }

                    setBuildings(data);
                } catch (error) {
                    console.error("Error fetching buildings:", error);
                    toast.error("Không thể tải danh sách tòa nhà");
                }
            }
        };
        loadBuildings();
    }, [financeModel]);

    // Initial load
    useEffect(() => {
        // Chỉ load data ban đầu nếu không phải decentralized
        // Nếu là decentralized, đợi user chọn building rồi mới load
        if (financeModel !== "decentralized") {
            fetchLedgers(transFrom, transTo, page, perPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [financeModel]);

    // Handlers for pagination
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchLedgers(
            transFrom,
            transTo,
            newPage,
            perPage,
            financeModel === "decentralized" ? buildingId : undefined
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        setPage(1);
        fetchLedgers(
            transFrom,
            transTo,
            1,
            newPerPage,
            financeModel === "decentralized" ? buildingId : undefined
        );
    };

    // Handler for filter
    const handleFilterSubmit = () => {
        if (!transFrom || !transTo) {
            toast.error("Vui lòng chọn khoảng thời gian");
            return;
        }
        if (new Date(transFrom) > new Date(transTo)) {
            toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            return;
        }
        if (financeModel === "decentralized" && !buildingId) {
            toast.error("Vui lòng chọn tòa nhà");
            return;
        }
        setPage(1);
        fetchLedgers(
            transFrom,
            transTo,
            1,
            perPage,
            financeModel === "decentralized" ? buildingId : undefined
        );
    };

    // Handler for reset filter
    const handleFilterReset = () => {
        const defaultFrom = new Date(new Date().setDate(1))
            .toISOString()
            .split("T")[0];
        const defaultTo = new Date().toISOString().split("T")[0];
        setTransFrom(defaultFrom);
        setTransTo(defaultTo);
        setBuildingId("");
        setPage(1);
        setLedgers([]);
        setMeta({
            page: 0,
            totalPages: 1,
            size: 10,
            totalElements: 0,
        });
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "revenue":
                return <Badge className="bg-green-500">Thu</Badge>;
            case "expense":
                return <Badge className="bg-red-500">Chi</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    };

    // Handle opening adjustment dialog
    const handleViewAdjustments = (ledger: Ledger) => {
        setSelectedLedger(ledger);
        setAdjustmentDialogOpen(true);
    };

    // Handle creating new adjustment
    const handleCreateAdjustment = (ledger: Ledger) => {
        setSelectedLedger(ledger);
        setCreateAdjustmentDialogOpen(true);
    };

    // Handle submit create adjustment
    const handleAdjustmentSubmit = async (data: AdjustmentFormSchema) => {
        if (!selectedLedger) return;

        try {
            setCreatingAdjustment(true);
            const payload = {
                amount: parseFloat(data.amount),
                reason: data.reason,
            };

            const response = await createAdjustment(selectedLedger.id, payload);
            toast.success(response.message || "Tạo điều chỉnh thành công");
            setCreateAdjustmentDialogOpen(false);
            setSelectedLedger(null);
            // Refresh danh sách sau khi tạo
            fetchLedgers(
                transFrom,
                transTo,
                page,
                perPage,
                financeModel === "decentralized" ? buildingId : undefined
            );
        } catch (error: any) {
            console.error("Error creating adjustment:", error);
        } finally {
            setCreatingAdjustment(false);
        }
    };

    return (
        <div className="p-3 space-y-6 bg-gray-50 min-h-screen">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Tổng giao dịch
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {statistics.totalTransactions}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">GD hôm nay</p>
                                <p className="text-2xl font-bold mt-1">
                                    {statistics.todayTransactions}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng thu</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">
                                    {formatCurrency(statistics.totalRevenue)}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng chi</p>
                                <p className="text-2xl font-bold mt-1 text-red-600">
                                    {formatCurrency(statistics.totalExpense)}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Số dư</p>
                                <p className="text-2xl font-bold mt-1 text-blue-600">
                                    {formatCurrency(statistics.balance)}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-yellow-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Table */}
            <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-0">
                    {/* Filter Bar */}
                    <div className="p-4 border-b bg-gray-50">
                        <div
                            className={`grid grid-cols-1 gap-3 ${
                                financeModel === "decentralized"
                                    ? "md:grid-cols-5"
                                    : "md:grid-cols-4"
                            }`}
                        >
                            <Input
                                type="date"
                                value={transFrom}
                                onChange={(e) => setTransFrom(e.target.value)}
                                placeholder="Từ ngày"
                                className="bg-white"
                            />

                            <Input
                                type="date"
                                value={transTo}
                                onChange={(e) => setTransTo(e.target.value)}
                                placeholder="Đến ngày"
                                className="bg-white"
                            />

                            {financeModel === "decentralized" && (
                                <Select value={buildingId} onValueChange={setBuildingId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Chọn tòa nhà"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.map((building) => (
                                            <SelectItem key={building.id} value={building.id}>
                                                {building.building_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <div className="col-span-1 md:col-span-2 flex gap-2">
                                <Button
                                    onClick={handleFilterSubmit}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                                >
                                    Filter
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleFilterReset}
                                    className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-gray-900 border-0"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="relative overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b sticky top-0">
                            <tr>
                                <th className="px-3 py-3 text-left font-semibold">STT</th>
                                <th className="px-3 py-3 text-left font-semibold">Ngày GD</th>
                                <th className="px-3 py-3 text-left font-semibold">
                                    Số chứng từ
                                </th>
                                <th className="px-3 py-3 text-left font-semibold">Loại</th>
                                <th className="px-3 py-3 text-left font-semibold">Mô tả</th>
                                <th className="px-3 py-3 text-left font-semibold">
                                    Người nộp
                                </th>
                                <th className="px-3 py-3 text-left font-semibold">
                                    Người nhận
                                </th>
                                <th className="px-3 py-3 text-right font-semibold">
                                    Số tiền HĐ
                                </th>
                                <th className="px-3 py-3 text-right font-semibold">
                                    Số tiền thực
                                </th>
                                <th className="px-3 py-3 text-right font-semibold">Số dư</th>
                                <th className="px-3 py-3 text-center font-semibold">
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="px-3 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2"/>
                                            <span>Đang tải...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : ledgers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-3 py-8 text-center text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                ledgers.map((ledger, index) => (
                                    <tr
                                        key={ledger.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {(page - 1) * perPage + index + 1}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {new Date(ledger.transaction_date).toLocaleDateString(
                                                "vi-VN"
                                            )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                            {ledger.voucher_number}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {getTypeBadge(ledger.type)}
                                        </td>
                                        <td className="px-3 py-2 text-sm max-w-[200px] truncate">
                                            {ledger.description}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            <div>{ledger.payer_name}</div>
                                            <div className="text-xs text-gray-500">
                                                {ledger.contact_info}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {ledger.receiver_name}
                                        </td>
                                        <td
                                            className={`px-3 py-2 whitespace-nowrap text-sm text-right font-medium ${
                                                ledger.type === "revenue"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {ledger.type === "revenue" ? "+" : "-"}
                                            {formatCurrency(ledger.amount)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                                            {formatCurrency(ledger.final_amount)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                                            {formatCurrency(ledger.balance)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewAdjustments(ledger)}
                                                    className="h-8 w-8 p-0 hover:bg-blue-50"
                                                    title="Xem điều chỉnh"
                                                >
                                                    <Eye className="h-4 w-4 text-blue-600"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCreateAdjustment(ledger)}
                                                    className="h-8 w-8 p-0 hover:bg-green-50"
                                                    title="Tạo điều chỉnh"
                                                >
                                                    <PlusCircle className="h-4 w-4 text-green-600"/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && ledgers.length > 0 && (
                <DataPagination
                    meta={meta}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            )}

            {/* Adjustments Dialog - View */}
            <AdjustmentDialog
                open={adjustmentDialogOpen}
                onOpenChange={setAdjustmentDialogOpen}
                ledger={selectedLedger}
            />

            {/* Adjustments Dialog - Create */}
            <ActionFormAdjustment
                open={createAdjustmentDialogOpen}
                onOpenChange={setCreateAdjustmentDialogOpen}
                onSubmit={handleAdjustmentSubmit}
                loading={creatingAdjustment}
                ledgerInfo={
                    selectedLedger
                        ? {
                            voucher_number: selectedLedger.voucher_number,
                            amount: selectedLedger.amount,
                            description: selectedLedger.description,
                        }
                        : null
                }
            />
        </div>
    );
}
