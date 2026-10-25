import request from "@/utils/request.ts";
import type {
    EquipmentResponse,
    EquipmentSearchParams,
    PageResponse,
    EquipmentHistoryResponse,
    EquipmentHistoryParams,
    CreateEquipmentPayload,
    UpdateEquipmentPayload,
    BatchDeleteEquipmentPayload,
} from "@/types/Equipment.ts";

// =====================================================
// Equipment API Client
// Spec: Equipment_API_Spec.md
// Base URL: /api/v1 (configured in request.ts)
// =====================================================

/**
 * 2.1 – Tìm kiếm và Phân trang Danh sách Thiết bị
 * GET /equipment
 */
export const searchEquipmentAPI = async (
    params?: EquipmentSearchParams,
): Promise<PageResponse<EquipmentResponse>> => {
    const response = await request({
        url: "/equipment",
        method: "GET",
        params,
    });
    return response as PageResponse<EquipmentResponse>;
};

/**
 * 2.2 – Lấy Chi Tiết Một Thiết Bị Theo ID
 * GET /equipment/{id}
 */
export const getEquipmentByIdAPI = async (
    id: string,
): Promise<EquipmentResponse> => {
    const response = await request({
        url: `/equipment/${id}`,
        method: "GET",
    });
    return response as EquipmentResponse;
};

/**
 * 2.3 – Tạo Mới Thiết Bị
 * POST /equipment
 */
export const createEquipmentAPI = async (
    data: CreateEquipmentPayload,
): Promise<EquipmentResponse> => {
    const response = await request({
        url: "/equipment",
        method: "POST",
        data,
    });
    return response as EquipmentResponse;
};

/**
 * 2.4 – Cập Nhật Thông Tin Thiết Bị
 * PUT /equipment/{id}
 */
export const updateEquipmentAPI = async (
    id: string,
    data: UpdateEquipmentPayload,
): Promise<EquipmentResponse> => {
    const response = await request({
        url: `/equipment/${id}`,
        method: "PUT",
        data,
    });
    return response as EquipmentResponse;
};

/**
 * 2.5 – Lịch Sử Chi Phí / Sửa Chữa Của Thiết Bị
 * GET /equipment/history
 */
export const getEquipmentHistoryAPI = async (
    params?: EquipmentHistoryParams,
): Promise<EquipmentHistoryResponse[]> => {
    const response = await request({
        url: "/equipment/history",
        method: "GET",
        params,
    });
    return response as EquipmentHistoryResponse[];
};

/**
 * 2.6 – Xóa Thiết Bị Hàng Loạt (Batch Soft Delete)
 * POST /equipment/delete
 */
export const deleteEquipmentsAPI = async (
    ids: BatchDeleteEquipmentPayload,
): Promise<string> => {
    const response = await request({
        url: "/equipment/delete",
        method: "POST",
        data: ids,
    });
    return response as string;
};
