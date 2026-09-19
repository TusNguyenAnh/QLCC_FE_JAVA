import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import type { DepositContract, DepositStats } from "@/types/Deposit.ts";
import type { PaginationMeta } from "@/types/Pagination.ts";
import { formatCurrency } from "@/utils/common.ts";
import {
  DollarSign,
  FileText,
  FileSpreadsheet,
  PlusCircle,
} from "lucide-react";
import DepositForm, {
  type DepositFormSchema,
} from "@/pages/deposit/action-form-deposit.tsx";
import { createDepositAPI, getDepositContractsAPI } from "@/apis/depositAPI.ts";
import axios from "axios";
import type { bdItemCheckbox } from "@/types/Building.ts";
import { getAllBdAPI } from "@/apis/bdAPI.ts";
import { findByIdAPI } from "@/apis/orgAPI.ts";
import { AuthContext } from "@/context/AuthContext.tsx";
import { DataPagination } from "@/layouts/pagination/data-pagination.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FilterDepositForm,
  type FilterDepositSchema,
} from "./filter-form-deposit.tsx";

export default function Deposit() {
  const [contracts, setContracts] = useState<DepositContract[]>([]);
  const [stats, setStats] = useState<DepositStats>();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [listBd, setListBd] = useState([]);
  const [listBank, setListBank] = useState([]);
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

  // Filter state
  const [appliedFilters, setAppliedFilters] = useState<FilterDepositSchema>({
    bank_name: "all",
    term: "all",
    deposit_from: undefined,
    deposit_to: undefined,
    maturity_from: undefined,
    maturity_to: undefined,
    building_id: "all",
  });

  // Key để reset filter form khi cần
  const [filterKey, setFilterKey] = useState(0);

  // State để quản lý hiển thị filter form
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);

  // Fetch contracts on mount or when filters change
  useEffect(() => {
    fetchBuildings();
    fetchBanks();
  }, []);

  // Fetch contracts function
  const fetchContracts = async (
    filterParams: FilterDepositSchema,
    pageNum = 1,
    pageSize = 10,
    isCal = false,
  ) => {
    // Cần có building_id để fetch
    const buildingId = filterParams.building_id;
    if (!buildingId || buildingId === "all") {
      setContracts([]);
      setMeta({
        page: 0,
        totalPages: 1,
        size: pageSize,
        totalElements: 0,
      });
      // Reset stats khi clear filter
      setStats({
        total_fund: 0,
        total_contracts: 0,
      });
      return;
    }

    try {
      setLoading(true);

      // Build filters object
      const filters: any = {};

      if (filterParams.bank_name && filterParams.bank_name !== "all") {
        filters.bank_name = filterParams.bank_name;
      }

      if (filterParams.term && filterParams.term !== "all") {
        filters.term = filterParams.term;
      }

      if (filterParams.deposit_from) {
        filters.deposit_from = filterParams.deposit_from;
      }

      if (filterParams.deposit_to) {
        filters.deposit_to = filterParams.deposit_to;
      }

      if (filterParams.maturity_from) {
        filters.maturity_from = filterParams.maturity_from;
      }

      if (filterParams.maturity_to) {
        filters.maturity_to = filterParams.maturity_to;
      }

      const response = await getDepositContractsAPI(
        buildingId,
        pageNum,
        pageSize,
        filters,
      );

      setContracts(response.result?.data || []);
      setMeta(
        response.result || {
          page: 0,
          totalPages: 1,
          size: pageSize,
          totalElements: 0,
        },
      );

      // Calculate stats from data
      if (isCal) {
        const totalFund = (response.result?.data || []).reduce(
          (sum: number, contract: DepositContract) =>
            sum + parseFloat(contract.money),
          0,
        );

        setStats({
          total_fund: totalFund,
          total_contracts: response.result?.totalElements || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Không thể tải danh sách hợp đồng tiền gửi");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      let data = await getAllBdAPI();

      if (orgManage) {
        // Lọc toà nhà theo orgManage
        const bdByOrg = await findByIdAPI(orgManage);
        data = data.filter((item: any) => bdByOrg.building.includes(item.id));
      }

      setBuildings(data);

      const items = data.map(function (item: bdItemCheckbox) {
        return {
          value: item.id,
          label: item.building_name,
        };
      });
      setListBd(items);
    } catch (err) {
      console.log(err);
      toast.error("Không thể tải danh sách tòa nhà");
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await axios.get("https://api.vietqr.io/v2/banks");
      const data = response.data.data;
      const items = data.map(function (item: {
        id: string;
        shortName: string;
      }) {
        return {
          value: item.id,
          label: item.shortName,
        };
      });

      setListBank(items);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tải danh sách ngân hàng");
    }
  };

  // Handlers for pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchContracts(appliedFilters, newPage, perPage, false);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
    fetchContracts(appliedFilters, 1, newPerPage, false);
  };

  // Handler for filter
  const handleFilterSubmit = (filters: FilterDepositSchema) => {
    setAppliedFilters(filters);
    setPage(1);
    fetchContracts(filters, 1, perPage, true);
  };

  // Handler for reset filter
  const handleFilterReset = () => {
    const defaultFilters: FilterDepositSchema = {
      bank_name: "all",
      term: "all",
      deposit_from: undefined,
      deposit_to: undefined,
      maturity_from: undefined,
      maturity_to: undefined,
      building_id: "all",
    };
    setAppliedFilters(defaultFilters);
    setPage(1);
    setFilterKey((prev) => prev + 1);
    fetchContracts(defaultFilters, 1, perPage, false);
  };

  const handleExportExcel = () => {
    toast.info("Tính năng xuất Excel sẽ sớm ra mắt!");
  };

  const handleAddContract = () => {
    setOpenDialog(true);
  };

  const submitCreateTask = async (data: DepositFormSchema) => {
    setLoading(true);
    try {
      await createDepositAPI(data);
      toast.success("Thêm mới thành công!");
      setOpenDialog(false);
      // Refresh danh sách - tính lại stats sau khi thêm mới
      fetchContracts(appliedFilters, page, perPage, true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="max-w-[1400px] mx-auto py-4 px-4">
      {/* Header with Summary */}
      <div className="mb-2">
        <div className="grid grid-cols-2 gap-3">
          {/* Total Fund Card */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
              <DollarSign className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Tổng số tiền tại ngân hàng
              </p>
              <p className="text-xl font-bold text-yellow-900">
                {formatCurrency(stats?.total_fund || 0)}
              </p>
            </div>
          </div>

          {/* Total Contracts Card */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Tổng số hợp đồng
              </p>
              <p className="text-xl font-bold text-blue-600">
                {stats?.total_contracts}
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              size="sm"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button onClick={handleAddContract} size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Thêm hợp đồng
            </Button>
          </div>
        </div>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 transition-all duration-200">
          <FilterDepositForm
            key={filterKey}
            onSubmit={handleFilterSubmit}
            onReset={handleFilterReset}
            buildings={buildings}
            banks={listBank}
          />
        </CollapsibleContent>
      </Collapsible>

      <DepositForm
        onSubmit={submitCreateTask}
        open={openDialog}
        setOpen={setOpenDialog}
        itemsBd={listBd}
        itemsBank={listBank}
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
                    Ngân hàng
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Số tài khoản
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Kỳ hạn (tháng)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày gửi
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày đáo hạn
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Lãi suất (%)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Số tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-3 text-center text-gray-500 text-sm"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-3 text-center text-gray-500 text-sm"
                    >
                      {appliedFilters.building_id === "all"
                        ? "Vui lòng chọn tòa nhà để xem danh sách hợp đồng"
                        : "Không có dữ liệu"}
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract, index) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {(meta.current_page - 1) * meta.per_page + index + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contract.bank_name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {contract.account_number}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {contract.term}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(contract.deposit_date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(contract.maturity_date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {contract.interest_rate}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(contract.money))}
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
      {!loading && contracts.length > 0 && (
        <DataPagination
          meta={meta}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </div>
  );
}
