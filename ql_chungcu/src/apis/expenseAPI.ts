import request from "@/utils/request.ts";
import type {
    Expense,
    ExpenseCategory,
    ExpenseCreateRequest,
    ExpenseDetailItemResponse,
    ExpenseFilterRequest,
    ExpenseFilterResult,
    ExpenseFilters,
    ExpenseSummary,
    ExpenseType,
} from "@/types/Expense.ts";
import type { PaginationMeta } from "@/types/Pagination.ts";

// =====================================================
// Expense API Client
// Spec: FE-SPEC-DECENTRALIZED-EXPENSE v1.0.0
// Base URL: /api/v1 (configured in request.ts)
// =====================================================

// --------------------------------------------------
// 5.1 – Lọc danh sách khoản chi (phân trang)
// POST /expense/filter/{complexId}
// --------------------------------------------------

export interface FilterExpensesResponse {
    code: number;
    result: ExpenseFilterResult;
}

/**
 * Lọc & phân trang danh sách khoản chi theo Cụm hoặc Tòa.
 *
 * @param complexId - ID cụm quản trị (từ AuthContext.complex)
 * @param filters   - Payload ExpenseFilterRequest; pageNumber là 0-based
 */
export const filterExpensesAPI = async (
    complexId: string,
    filters: ExpenseFilterRequest,
): Promise<ExpenseFilterResult> => {
    const response = await request({
        url: `/expense/filter/${complexId}`,
        method: "POST",
        data: filters,
    });
    // request interceptor đã unwrap response.data.result
    return response as ExpenseFilterResult;
};

// --------------------------------------------------
// 5.2 – Lấy chi tiết phân bổ tòa của khoản chi
// GET /expense/{expenseId}/detail/{complexId}
// --------------------------------------------------

/**
 * Lấy danh sách các tòa nhà và số tiền được phân bổ cho khoản chi Cụm.
 *
 * @param expenseId - ID khoản chi
 * @param complexId - ID cụm
 * @returns Mảng phân bổ từng tòa (description = tên tòa, amount = tiền phân bổ)
 */
export const getExpenseDetailAPI = async (
    expenseId: string,
    complexId: string,
): Promise<ExpenseDetailItemResponse[]> => {
    const response = await request({
        url: `/expense/${expenseId}/detail/${complexId}`,
        method: "GET",
    });
    return response as ExpenseDetailItemResponse[];
};

// --------------------------------------------------
// 5.3 – Tạo khoản chi mới
// POST /expense
// --------------------------------------------------

/**
 * Tạo khoản chi mới (Cụm hoặc Tòa).
 *
 * - Với type = 'cum': expenseDetails phải chứa đầy đủ tất cả tòa trong cụm.
 * - Với type = 'toa': expenseDetails chỉ gồm 1 phần tử (tòa chịu chi phí).
 * - Tổng amount trong expenseDetails PHẢI bằng totalAmount (validate ở FE trước khi gọi).
 *
 * @param data - Payload ExpenseCreateRequest
 */
export const createExpenseAPI = async (
    data: ExpenseCreateRequest,
): Promise<void> => {
    await request({
        url: `/expense`,
        method: "POST",
        data,
    });
};

// --------------------------------------------------
// Legacy API (giữ lại để không phá vỡ code cũ)
// --------------------------------------------------

interface GetExpensesResponse {
    message: string;
    data: Expense[];
    meta: PaginationMeta;
    summary: ExpenseSummary;
}

/**
 * @deprecated Dùng filterExpensesAPI thay thế.
 */
export const getExpenses = async (
    filters: ExpenseFilters,
): Promise<GetExpensesResponse> => {
    const response = await request({
        url: "/expenses/getExpense",
        method: "POST",
        data: filters,
    });
    return response as GetExpensesResponse;
};

// --------------------------------------------------
// Utility helpers (dùng nội bộ trong FE)
// --------------------------------------------------

/**
 * Tính toán phân bổ tiền cho từng tòa dựa trên financialRatio.
 * Sai số làm tròn được cộng vào tòa đầu tiên.
 *
 * @param totalAmount - Tổng số tiền cần phân bổ
 * @param buildings   - Danh sách tòa nhà kèm financialRatio (từ getAllBdAPI)
 * @returns Mảng { buildingId, amount } đã được tính toán
 */
export function computeAllocation(
    totalAmount: number,
    buildings: Array<{ id: string; financialRatio: number }>,
): Array<{ buildingId: string; amount: number }> {
    if (!buildings.length) return [];

    // Tính tổng ratio để chuẩn hóa (đề phòng ratio không cộng tròn = 1)
    const totalRatio = buildings.reduce((sum, b) => sum + (b.financialRatio ?? 0), 0);
    const safeRatio = totalRatio > 0 ? totalRatio : buildings.length;

    const allocations = buildings.map((b, i) => {
        const ratio = totalRatio > 0 ? b.financialRatio : 1;
        // Phân bổ đều nếu không có ratio
        return {
            buildingId: b.id,
            amount: Math.floor((totalAmount * ratio) / safeRatio),
        };
    });

    // Phần dư làm tròn cộng vào tòa đầu tiên
    const allocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const remainder = totalAmount - allocated;
    if (allocations.length > 0) {
        allocations[0].amount += remainder;
    }

    return allocations;
}

/** Format danh mục chi phí sang nhãn tiếng Việt */
export function formatExpenseCategory(category: ExpenseCategory | string): string {
    switch (category) {
        case "BAO_DUONG":
            return "Chi bảo trì, bảo dưỡng";
        case "SUA_CHUA":
            return "Chi thay thế, sửa chữa";
        default:
            return category;
    }
}

/** Format loại hình khoản chi sang nhãn tiếng Việt */
export function formatExpenseType(type: ExpenseType | string): string {
    switch (type) {
        case "cum":
            return "Chi chung Cụm";
        case "toa":
            return "Chi riêng Tòa";
        default:
            return type;
    }
}
