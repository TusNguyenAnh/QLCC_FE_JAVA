import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import type {PaginationMeta} from "@/types/Pagination.ts";

interface DataPaginationProps {
    meta: PaginationMeta;// Metadata từ API
    onPageChange: (page: number) => void;// Callback khi chuyển trang
    onPerPageChange?: (perPage: number) => void;// Callback khi thay đổi số bản ghi
    showPerPageSelector?: boolean;// Hiển thị selector (mặc định: true)
    perPageOptions?: number[];// Các option cho selector (mặc định: [10, 25, 50, 100])
    className?: string; // CSS classes thêm
}

export function DataPagination({
                                   meta,
                                   onPageChange,
                                   onPerPageChange,
                                   showPerPageSelector = true,
                                   perPageOptions = [1, 5, 10, 25, 50, 100],
                                   className = "",
                               }: DataPaginationProps) {
    const {page, totalPages, totalElements, size} = meta;
    // Convert 0-indexed page to 1-indexed for display
    const current_page = page + 1;
    const last_page = totalPages;
    const total = totalElements;
    const per_page = size;

    // Tạo danh sách số trang để hiển thị
    const generatePageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxVisiblePages = 7;
        const sidePages = 1;

        if (last_page <= maxVisiblePages) {
            // Hiển thị tất cả trang nếu ít hơn maxVisiblePages
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu
            pages.push(1);

            // Hiển thị ellipsis nếu cần
            if (current_page > 3) {
                pages.push("ellipsis");
            }

            // Hiển thị các trang xung quanh trang hiện tại
            const start = Math.max(2, current_page - sidePages);
            const end = Math.min(last_page - 1, current_page + sidePages);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Hiển thị ellipsis nếu cần
            if (current_page < last_page - 2) {
                pages.push("ellipsis");
            }

            // Luôn hiển thị trang cuối
            if (last_page > 1) {
                pages.push(last_page);
            }
        }

        return pages;
    };

    const pages = generatePageNumbers();
    const startItem = total === 0 ? 0 : (current_page - 1) * per_page + 1;
    const endItem = Math.min(current_page * per_page, total);

    return (
        <div className={`mt-4 bg-white rounded-lg border shadow-sm ${className}`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4">
                {/* Left side - Info and per page selector */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="whitespace-nowrap">
              Hiển thị{" "}
                <span className="font-semibold text-gray-900">{startItem}</span> -{" "}
                <span className="font-semibold text-gray-900">{endItem}</span>
            </span>
                        <span className="hidden sm:inline">trong tổng số</span>
                        <span className="font-semibold text-gray-900">{total}</span>
                        <span>kết quả</span>
                    </div>

                    {showPerPageSelector && onPerPageChange && (
                        <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Hiển thị:
              </span>
                            <Select
                                value={per_page.toString()}
                                onValueChange={(value) => onPerPageChange(parseInt(value))}
                            >
                                <SelectTrigger
                                    className="h-9 w-[75px] bg-white border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder={per_page.toString()}/>
                                </SelectTrigger>
                                <SelectContent>
                                    {perPageOptions.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={option.toString()}
                                            className="cursor-pointer"
                                        >
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">/trang</span>
                        </div>
                    )}
                </div>

                {/* Right side - Pagination controls */}
                <div className="flex items-center gap-2">
                    {/* First page button */}
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={current_page === 1}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        title="Trang đầu"
                    >
                        <ChevronsLeft className="h-4 w-4"/>
                    </button>

                    {/* Previous page button */}
                    <button
                        onClick={() => current_page > 1 && onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        title="Trang trước"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>

                    {/* Page numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                        {pages.map((page, index) =>
                                page === "ellipsis" ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="inline-flex items-center justify-center w-9 h-9 text-gray-500"
                                    >
                  ...
                </span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => onPageChange(page as number)}
                                        className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                                            current_page === page
                                                ? "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                        )}
                    </div>

                    {/* Mobile page indicator */}
                    <div
                        className="sm:hidden inline-flex items-center justify-center px-3 h-9 rounded-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                        {current_page} / {last_page}
                    </div>

                    {/* Next page button */}
                    <button
                        onClick={() =>
                            current_page < last_page && onPageChange(current_page + 1)
                        }
                        disabled={current_page === last_page}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        title="Trang sau"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>

                    {/* Last page button */}
                    <button
                        onClick={() => onPageChange(last_page)}
                        disabled={current_page === last_page}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        title="Trang cuối"
                    >
                        <ChevronsRight className="h-4 w-4"/>
                    </button>
                </div>
            </div>
        </div>
    );
}
