// =====================================================
// EXPENSE MODULE – Type Contracts
// Spec: FE-SPEC-DECENTRALIZED-EXPENSE v1.0.0
// Backend: ExpenseController (/api/v1/expense)
// =====================================================

// --------------------------------------------------
// Enums / Literal Types
// --------------------------------------------------

/** Mã hạng mục chi phí */
export type ExpenseCategory = 'BAO_DUONG' | 'SUA_CHUA';

/** Loại hình khoản chi */
export type ExpenseType = 'cum' | 'toa';

// --------------------------------------------------
// Request DTOs  (FE → BE)
// --------------------------------------------------

/** Chi tiết phân bổ cho 1 tòa nhà trong khoản chi Cụm */
export interface ExpenseDetailRequest {
  buildingId: string;
  amount: number; // số thực, không có dấu phân cách
}

/** Payload tạo khoản chi mới */
export interface ExpenseCreateRequest {
  taskId: string;
  type: ExpenseType;
  category: ExpenseCategory;
  totalAmount: number;          // > 0
  description?: string;         // tối đa 1000 ký tự
  payDate: string;              // ISO-8601: "2026-03-15T09:00:00Z"
  expenseDetails: ExpenseDetailRequest[]; // bắt buộc cả cum lẫn toa
}

/** Payload lọc danh sách khoản chi (POST body) */
export interface ExpenseFilterRequest {
  type: ExpenseType;
  buildingId: string[];       // cum: tất cả ID tòa; toa: [ID tòa được chọn]
  category?: ExpenseCategory[];
  proposedFrom?: string;      // "YYYY-MM-DDTHH:mm:ss"
  proposedTo?: string;        // "YYYY-MM-DDTHH:mm:ss"
  pageNumber: number;         // 0-based
  pageSize: number;           // default 10
}

// --------------------------------------------------
// Response DTOs  (BE → FE)
// --------------------------------------------------

/** 1 dòng trong bảng danh sách khoản chi */
export interface ExpenseItemResponse {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  payDate: string; // ISO-8601
}

/** 1 dòng phân bổ tòa nhà trong modal chi tiết khoản chi Cụm */
export interface ExpenseDetailItemResponse {
  id: string;
  category: ExpenseCategory;
  amount: number;
  /** Trường này chứa "Tên tòa nhà" ở API getExpenseDetail */
  description: string;
  payDate: string;
}

/** Wrapper phân trang trả về từ POST /expense/filter/{complexId} */
export interface ExpenseFilterResult {
  data?: ExpenseItemResponse[];
  content?: ExpenseItemResponse[];
  page?: number;
  pageNumber?: number;
  size?: number;
  pageSize?: number;
  totalElements: number;
  totalPages: number;
}

// --------------------------------------------------
// Legacy types (giữ lại để không phá vỡ code cũ)
// --------------------------------------------------

/** @deprecated Dùng ExpenseItemResponse thay thế */
export interface Expense {
  id: string;
  title: string;
  category: string;
  originalAmount: string;
  amountPaid: string;
  remaining: number;
  status: string;
  vendor: string;
  description: string;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

/** @deprecated Dùng ExpenseFilterRequest thay thế */
export interface ExpenseFilters {
  perPage?: number;
  page?: number;
  category?: string;
  status?: string;
  proposedFrom?: string;
  proposedTo?: string;
  approved?: number;
  buildingId?: string;
  // legacy snake_case fields
  proposed_from?: string;
  proposed_to?: string;
  building_id?: string;
}

export interface ExpenseSummary {
  totalPaid: number;
  totalExpect: number;
  // legacy
  total_paid?: number;
  total_expect?: number;
}
