// =====================================================
// EQUIPMENT MODULE – Type Contracts
// Spec: Equipment_API_Spec.md
// Backend: EquipmentController (/api/v1/equipment)
// =====================================================

export interface PageResponse<T> {
  data: T[];             // Danh sách bản ghi trên trang hiện tại
  page: number;          // Trang hiện tại (0-indexed, bắt đầu từ 0)
  size: number;          // Số lượng phần tử mỗi trang
  totalElements: number; // Tổng số bản ghi thỏa mãn điều kiện tìm kiếm
  totalPages: number;    // Tổng số trang
}

export interface EquipmentResponse {
  id: string;               // ID định danh của thiết bị (UUID)
  complexId: string;        // ID khu chung cư
  equipmentCode: string;    // Mã thiết bị
  equipmentName: string;    // Tên thiết bị
  category: string;         // Hạng mục / Phân loại thiết bị
  operationDate: string;    // Ngày đưa vào vận hành (ISO 8601 Instant)
  description: string | null;// Ghi chú, mô tả chi tiết
  createdAt: string;        // Thời gian tạo
  updatedAt: string;        // Thời gian cập nhật gần nhất
}

export interface EquipmentHistoryResponse {
  expenseDate: string;      // Ngày phát sinh chi phí / thanh toán
  description: string;      // Nội dung chi tiêu / sửa chữa bảo dưỡng
  amount: number;           // Số tiền chi phí (VND)
}

export interface CreateEquipmentPayload {
  equipmentCode: string;
  equipmentName: string;
  category: string;
  operationDate?: string;
  description?: string;
}

export interface UpdateEquipmentPayload {
  equipmentCode: string;
  equipmentName: string;
  category: string;
  description?: string;
}

export interface EquipmentSearchParams {
  keyword?: string;         // Tìm kiếm theo mã thiết bị hoặc tên thiết bị
  category?: string;        // Lọc chính xác theo hạng mục thiết bị
  page?: number;            // Mặc định: 0
  size?: number;            // Mặc định: 10, tối đa 50
}

export interface EquipmentHistoryParams {
  id?: string;              // ID thiết bị (UUID)
  category?: string;        // Lọc theo hạng mục chi phí
}

export type BatchDeleteEquipmentPayload = string[];
