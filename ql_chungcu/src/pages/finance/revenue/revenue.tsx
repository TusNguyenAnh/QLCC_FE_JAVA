import { useContext, useEffect, useState } from "react";
import {
  getRevenues,
  generateMonthlyRevenue,
  createRevenueAPI,
} from "@/apis/revenueAPI.ts";
import { getAllBdAPI } from "@/apis/bdAPI.ts";
import { getApartmentByBuilding } from "@/apis/aptAPI.ts";
import { createLedgerFromRevenue } from "@/apis/ledgerAPI.ts";
import type { Revenue, RevenueSummary } from "@/types/Revenue.ts";
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
  FilterRevenueForm,
  type FilterRevenueSchema,
} from "./filter-form-revenue.tsx";
import LedgerRevenue, { type LedgerFormSchema } from "./ledger-revenue.tsx";
import { getAllTaskTypeAPI } from "@/apis/taskTypeAPI.ts";
import { AuthContext } from "@/context/AuthContext.tsx";
import RevenueForm, {
  type RevenueFormSchema,
} from "@/pages/finance/revenue/action-form-revenue.tsx";
import { createTaskAPI } from "@/apis/taskAPI.ts";
import FinanceModelWarning from "@/pages/finance/finance-model-warning.tsx";
import { findByIdAPI } from "@/apis/orgAPI.ts";

export default function Revenue() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [creatingLedger, setCreatingLedger] = useState(false);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const { orgManage } = useContext(AuthContext);

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
  const [summary, setSummary] = useState<RevenueSummary>({
    total_paid: 0,
    total_expect: 0,
  });

  // Filter state
  const [appliedFilters, setAppliedFilters] = useState<FilterRevenueSchema>({
    status: "all",
    approved: "all",
    proposed_from: "",
    proposed_to: "",
    building_id: "all",
  });

  // Key để reset filter form khi cần
  const [filterKey, setFilterKey] = useState(0);

  // State để quản lý hiển thị filter form
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listBd, setListBd] = useState([]);
  const [listTt, setListTt] = useState([]);
  const [listApt, setListApt] = useState([]);
  const [selectedBuildingForForm, setSelectedBuildingForForm] =
    useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const { complex, financeModel } = useContext(AuthContext);

  // Fetch revenues function
  const fetchRevenues = async (
    filterParams: FilterRevenueSchema,
    pageNum = 1,
    pageSize = 10,
  ) => {
    try {
      setLoading(true);

      // Build filters object, chỉ thêm field nếu không phải "all" hoặc rỗng
      const filters: any = {
        perPage: pageSize,
        page: pageNum,
      };

      if (filterParams.status && filterParams.status !== "all") {
        filters.status = filterParams.status;
      }

      if (filterParams.approved && filterParams.approved !== "all") {
        filters.approved = filterParams.approved;
      }

      if (filterParams.proposed_from) {
        filters.proposed_from = filterParams.proposed_from;
      }

      if (filterParams.proposed_to) {
        filters.proposed_to = filterParams.proposed_to;
      }

      if (filterParams.building_id && filterParams.building_id !== "all") {
        filters.building_id = filterParams.building_id;
      }

      const response = await getRevenues(filters);
      setRevenues(response.result?.data || []);
      setMeta(response.result || {
        page: 0,
        totalPages: 1,
        size: pageSize,
        totalElements: 0,
      });
      setSummary(response.summary || { total_paid: 0, total_expect: 0 });
    } catch (error) {
      console.error("Error fetching revenues:", error);
      toast.error("Không thể tải danh sách khoản thu");
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
      if (orgManage) {
        // Lọc toà nhà theo orgManage
        const bdByOrg = await findByIdAPI(orgManage);
        data = data.filter((item) => bdByOrg.building.includes(item.id));
      }

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

  const handleCreateLedger = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setLedgerDialogOpen(true);
  };

  const handleLedgerSubmit = async (data: LedgerFormSchema) => {
    if (!selectedRevenue) return;

    try {
      setCreatingLedger(true);

      // Loại bỏ các trường rỗng hoặc undefined
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const response = await createLedgerFromRevenue(
        selectedRevenue.id,
        filteredData,
      );
      toast.success(response.message || "Tạo ledger thành công");
      setLedgerDialogOpen(false);
      setSelectedRevenue(null);
      // Refresh danh sách sau khi tạo
      fetchRevenues(appliedFilters, page, perPage);
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
    fetchRevenues(appliedFilters, newPage, perPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
    fetchRevenues(appliedFilters, 1, newPerPage);
  };

  // Handler for filter
  const handleFilterSubmit = (filters: FilterRevenueSchema) => {
    setAppliedFilters(filters);
    setPage(1);
    fetchRevenues(filters, 1, perPage);
  };

  // Handler for reset filter
  const handleFilterReset = () => {
    const defaultFilters: FilterRevenueSchema = {
      status: "all",
      approved: "all",
      proposed_from: "",
      proposed_to: "",
      building_id: "all",
    };
    setAppliedFilters(defaultFilters);
    setPage(1);
    setFilterKey((prev) => prev + 1);
    fetchRevenues(defaultFilters, 1, perPage);
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "PAID":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "PARTIAL":
        return <Badge className="bg-yellow-500">Thanh toán một phần</Badge>;
      case "UNPAID":
      case "PENDING":
        return <Badge className="bg-red-500">Chưa thanh toán</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
      // Error đã được xử lý bởi interceptor
    }
  };

  const fetchApartmentsByBuilding = async (buildingId: string) => {
    if (!buildingId || buildingId === "ALL") {
      setListApt([]);
      return;
    }

    try {
      const data = await getApartmentByBuilding(buildingId);
      const items = data.map((item: any) => ({
        value: String(item.id),
        label: item.apt_number,
      }));
      setListApt(items);
    } catch (err) {
      console.error("Error fetching apartments:", err);
      toast.error("Không thể tải danh sách căn hộ");
      setListApt([]);
    }
  };

  const handleCreate = () => {
    fetchBuildings();
    getAllTaskType(complex);
    setListApt([]); // Reset apartment list
    setSelectedBuildingForForm(""); // Reset selected building
    setOpenDialog(true);
  };

  // Fetch apartments khi selectedBuildingForForm thay đổi
  useEffect(() => {
    if (selectedBuildingForForm) {
      fetchApartmentsByBuilding(selectedBuildingForForm);
    } else {
      setListApt([]);
    }
  }, [selectedBuildingForForm]);

  const submitCreateTask = async (data: RevenueFormSchema) => {
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

      const payloadRevenue = {
        title: data.task_name,
        original_amount: data.original_amount,
        description: data.description,
        task_id: newTask.id,
        building_id: data.building_id,
        apartment_id: data.apartment_id,
        revenue_type: data.revenue_type, // Lấy từ data thay vì state
      };

      await createRevenueAPI(payloadRevenue);
      toast.success("Thêm mới thành công!");
      setOpenDialog(false);
      // Refresh danh sách
      fetchRevenues(appliedFilters, page, perPage);
    } catch (err) {
      // Error đã được xử lý bởi interceptor
    } finally {
      setLoading(false);
    }
  };

  // Nếu chưa có finance model, hiển thị thông báo
  if (!financeModel) {
    return (
      <FinanceModelWarning message="Bạn cần thiết lập mô hình tài chính trước khi sử dụng chức năng quản lý thu" />
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
              <p className="text-xl font-bold text-gray-900">{meta.total}</p>
            </div>
          </div>

          {/* Item 2: Tiền dự kiến */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <svg
                className="w-5 h-5 text-blue-600"
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
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(summary.total_expect)}
              </p>
            </div>
          </div>

          {/* Item 3: Tiền đã thu */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tiền đã thu</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(summary.total_paid)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle Button and Form */}
      <Collapsible
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        className="mb-2"
      >
        <div className="mb-2 flex items-center justify-between">
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
            Thêm mới khoản thu
          </Button>
        </div>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 transition-all duration-200">
          <FilterRevenueForm
            key={filterKey}
            onSubmit={handleFilterSubmit}
            onReset={handleFilterReset}
            buildings={buildings}
          />
        </CollapsibleContent>
      </Collapsible>

      <RevenueForm
        onSubmit={submitCreateTask}
        open={openDialog}
        setOpen={setOpenDialog}
        itemsBd={listBd}
        itemsTt={listTt}
        itemsApt={listApt}
        onBuildingChange={setSelectedBuildingForForm}
      />

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
                    Căn hộ
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
                      colSpan={9}
                      className="px-3 py-3 text-center text-gray-500 text-sm"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : revenues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-3 text-center text-gray-500 text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  revenues.map((revenue, index) => (
                    <tr
                      key={`${revenue.id}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {(meta.current_page - 1) * meta.per_page + index + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {revenue.title || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {revenue.apartment ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {revenue.apartment.apt_number}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(revenue.original_amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(revenue.amount_paid)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatCurrency(revenue.remaining)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {getStatusBadge(revenue.status)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 max-w-[150px] truncate">
                        {revenue.description || "-"}
                      </td>
                      {revenue.approved_by && revenue.status != "paid" && (
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <Button
                            onClick={() => handleCreateLedger(revenue)}
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
      {!loading && revenues.length > 0 && (
        <DataPagination
          meta={meta}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}

      {/* Ledger Form Dialog */}
      <LedgerRevenue
        open={ledgerDialogOpen}
        setOpen={setLedgerDialogOpen}
        loading={creatingLedger}
        revenue={selectedRevenue}
        buildings={buildings}
        onSubmit={handleLedgerSubmit}
      />
    </div>
  );
}
