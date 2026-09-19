import { useContext, useEffect, useState } from "react";
import { createExpenseAPI, getExpenses } from "@/apis/expenseAPI.ts";
import { getAllBdAPI } from "@/apis/bdAPI.ts";
import { createLedgerFromExpense } from "@/apis/ledgerAPI.ts";
import type {
  Expense,
  ExpenseFilters,
  ExpenseSummary,
} from "@/types/Expense.ts";
import type { PaginationMeta } from "@/types/Pagination.ts";
import { DataPagination } from "@/layouts/pagination/data-pagination.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/common.ts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FilterExpenseForm,
  type FilterExpenseSchema,
} from "./filter-form-expense.tsx";
import LedgerExpense, { type LedgerFormSchema } from "./ledger-expense.tsx";
import ExpenseForm, {
  type ExpenseFormSchema,
} from "@/pages/finance/expense/action-form-expense.tsx";
import { AuthContext } from "@/context/AuthContext.tsx";
import { getAllTaskTypeAPI } from "@/apis/taskTypeAPI.ts";
import { createTaskAPI } from "@/apis/taskAPI.ts";
import FinanceModelWarning from "@/pages/finance/finance-model-warning.tsx";

export default function Expense() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [creatingLedger, setCreatingLedger] = useState(false);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [listBd, setListBd] = useState([]);
  const [listTt, setListTt] = useState([]);
  const { complex, financeModel } = useContext(AuthContext);

  // Pagination state
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 0,
    totalPages: 1,
    size: 10,
    totalElements: 0,
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Summary state
  const [summary, setSummary] = useState<ExpenseSummary>({
    total_paid: 0,
    total_expect: 0,
  });

  // Filter state
  const [appliedFilters, setAppliedFilters] = useState<FilterExpenseSchema>({
    category: "all",
    status: "all",
    proposed_from: "",
    proposed_to: "",
    approved: "all",
    building_id: "all",
  });

  // Key để reset filter form khi cần
  const [filterKey, setFilterKey] = useState(0);

  // State để quản lý hiển thị filter form
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch expenses function
  const fetchExpenses = async (
    filterParams: FilterExpenseSchema,
    pageNum = 1,
    pageSize = 10,
  ) => {
    try {
      setLoading(true);

      // Build filters object, chỉ thêm field nếu không phải "all"
      const filters: ExpenseFilters = {
        perPage: pageSize,
        page: pageNum,
      };

      if (filterParams.category && filterParams.category !== "all") {
        filters.category = filterParams.category;
      }

      if (filterParams.status && filterParams.status !== "all") {
        filters.status = filterParams.status;
      }

      if (filterParams.approved && filterParams.approved !== "all") {
        filters.approved = parseInt(filterParams.approved);
      }

      if (filterParams.building_id && filterParams.building_id !== "all") {
        filters.building_id = filterParams.building_id;
      }

      if (filterParams.proposed_from) {
        filters.proposed_from = filterParams.proposed_from;
      }

      if (filterParams.proposed_to) {
        filters.proposed_to = filterParams.proposed_to;
      }

      const response = await getExpenses(filters);
      setExpenses(response.result?.data || []);
      setMeta(response.result || {
        page: 0,
        totalPages: 1,
        size: pageSize,
        totalElements: 0,
      });
      setSummary(response.summary || { total_paid: 0, total_expect: 0 });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Không thể tải danh sách khoản chi");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBuildings();
  }, []);

  // Fetch buildings
  const fetchBuildings = async () => {
    try {
      let data = await getAllBdAPI();
      setBuildings(data);

      const items = [
        {
          label: "Tất cả",
          value: "ALL",
        },
        ...data.map((item) => ({
          label: item.building_name,
          value: String(item.id),
        })),
      ];

      setListBd(items);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("Không thể tải danh sách tòa nhà");
    }
  };

  const getAllTaskType = async (complexId: string) => {
    try {
      const data = await getAllTaskTypeAPI(complexId);
      const items = data.map(function (item: {
        id: string;
        type_name: string;
      }) {
        return {
          value: item.id,
          label: item.type_name,
        };
      });
      setListTt(items);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateLedger = (expense: Expense) => {
    setSelectedExpense(expense);
    setLedgerDialogOpen(true);
  };

  const handleLedgerSubmit = async (data: LedgerFormSchema) => {
    if (!selectedExpense) return;

    try {
      setCreatingLedger(true);

      // Loại bỏ các trường rỗng hoặc undefined
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Note: You may need to create a similar API function for expenses
      // For now using the revenue one as placeholder
      const response = await createLedgerFromExpense(
        selectedExpense.id,
        filteredData,
      );
      toast.success(response.message || "Tạo ledger thành công");
      setLedgerDialogOpen(false);
      setSelectedExpense(null);
      // Refresh danh sách sau khi tạo
      fetchExpenses(appliedFilters, page, perPage);
    } catch (error: any) {
      console.error("Error creating ledger:", error);
      toast.error(error?.message || "Không thể tạo ledger");
    } finally {
      setCreatingLedger(false);
    }
  };

  // Handlers for pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchExpenses(appliedFilters, newPage, perPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
    fetchExpenses(appliedFilters, 1, newPerPage);
  };

  // Handler for filter
  const handleFilterSubmit = (filters: FilterExpenseSchema) => {
    setAppliedFilters(filters);
    setPage(1);
    fetchExpenses(filters, 1, perPage);
  };

  // Handler for reset filter
  const handleFilterReset = () => {
    const defaultFilters: FilterExpenseSchema = {
      category: "all",
      status: "all",
      proposed_from: "",
      proposed_to: "",
      approved: "all",
      building_id: "all",
    };
    setAppliedFilters(defaultFilters);
    setPage(1);
    setFilterKey((prev) => prev + 1);
    fetchExpenses(defaultFilters, 1, perPage);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500">Thanh toán một phần</Badge>;
      case "unpaid":
        return <Badge className="bg-red-500">Chưa thanh toán</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "service":
        return "Dịch vụ";
      case "maintenance":
        return "Bảo trì";
      case "utilities":
        return "Tiện ích";
      case "other":
        return "Khác";
      default:
        return category;
    }
  };

  const getApprovedBadge = (approvedBy: string | null) => {
    if (approvedBy) {
      return <Badge className="bg-blue-500">Đã phê duyệt</Badge>;
    }
    return (
      <Badge variant="outline" className="text-gray-500">
        Chưa phê duyệt
      </Badge>
    );
  };

  const handleCreate = () => {
    fetchBuildings();
    getAllTaskType(complex);
    setOpenDialog(true);
  };

  const submitCreateTask = async (data: ExpenseFormSchema) => {
    setLoading(true);
    try {
      // Tạo FormData để gửi files
      const formData = new FormData();
      formData.append("task_name", data.task_name);
      formData.append("tasktype_id", data.tasktype_id || "");
      formData.append("description", data.description || "");

      // Thêm building_id array
      if (data.building_id && data.building_id.length > 0) {
        data.building_id.forEach((id) => {
          formData.append("building_id[]", id);
        });
      }

      // Thêm các file nếu có
      if (data.files && data.files.length > 0) {
        Array.from(data.files).forEach((file: File) => {
          formData.append("files[]", file);
        });
      }

      const newTask = await createTaskAPI(formData);

      const payloadExpense = {
        title: data.task_name,
        category: data.category,
        original_amount: data.original_amount,
        description: data.description,
        vendor: data.vendor,
        task_id: newTask.id,
        building_id: data.building_id,
        expense_type: data.expense_type,
      };

      await createExpenseAPI(payloadExpense);
      toast.success("Thêm mới thành công!");
      setOpenDialog(false);
      // Refresh danh sách
      fetchExpenses(appliedFilters, page, perPage);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const itemCategory = [
    { label: "Dịch vụ", value: "service" },
    { label: "Bảo trì", value: "maintenance" },
    { label: "Tiện ích", value: "utilities" },
    { label: "Khác", value: "other" },
  ];

  // Nếu chưa có finance model, hiển thị thông báo
  if (!financeModel) {
    return (
      <FinanceModelWarning message="Bạn cần thiết lập mô hình tài chính trước khi sử dụng chức năng quản lý chi" />
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto py-4 px-4">
      {/* Header with Summary */}
      <div className="mb-2">
        <div className="grid grid-cols-3 gap-3">
          {/* Item 1: Tổng số khoản */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tổng số khoản</p>
              <p className="text-xl font-bold text-gray-900">
                {meta?.total || 0}
              </p>
            </div>
          </div>

          {/* Item 2: Tiền dự kiến */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tiền dự kiến</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(summary?.total_expect || 0)}
              </p>
            </div>
          </div>

          {/* Item 3: Tiền đã chi */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tiền đã chi</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(summary?.total_paid || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle Button and Form */}
      <div className="mb-2">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="flex gap-2 justify-between mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Bộ lọc
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </CollapsibleTrigger>
            <Button
              className="hover: cursor-pointer"
              size="sm"
              onClick={handleCreate}
            >
              Thêm mới khoản chi
            </Button>
          </div>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 transition-all duration-200">
            <FilterExpenseForm
              key={filterKey}
              onSubmit={handleFilterSubmit}
              onReset={handleFilterReset}
              buildings={buildings}
            />
          </CollapsibleContent>
        </Collapsible>
        <ExpenseForm
          onSubmit={submitCreateTask}
          open={openDialog}
          setOpen={setOpenDialog}
          itemsBd={listBd}
          itemsTt={listTt}
          itemsCategory={itemCategory}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    STT
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiêu đề
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Danh mục
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nhà cung cấp
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Số tiền ban đầu
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Đã thanh toán
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Còn lại
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Phê duyệt
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-3 py-3 text-center text-gray-500 text-sm"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : !expenses || expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-3 py-3 text-center text-gray-500 text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, index) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {(meta.current_page - 1) * meta.per_page + index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
                          {expense.title}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {getCategoryLabel(expense.category)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {expense.vendor}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(expense.original_amount))}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(parseFloat(expense.amount_paid))}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatCurrency(expense.remaining)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {getApprovedBadge(expense.approved_by)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 max-w-[150px] truncate">
                        {expense.description}
                      </td>
                      {expense.approved_by && expense.status != "paid" && (
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <Button
                            onClick={() => handleCreateLedger(expense)}
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Tạo Ledger
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && expenses && expenses.length > 0 && (
        <DataPagination
          meta={meta}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}

      {/* Ledger Form Dialog */}
      <LedgerExpense
        open={ledgerDialogOpen}
        setOpen={setLedgerDialogOpen}
        loading={creatingLedger}
        expense={selectedExpense}
        onSubmit={handleLedgerSubmit}
      />
    </div>
  );
}
