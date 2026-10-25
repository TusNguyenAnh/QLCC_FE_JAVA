import { z } from "zod";

// =====================================================
// EQUIPMENT CATEGORIES CONFIGURATION
// =====================================================

export interface CategoryOption {
    value: string;
    label: string;
    badgeClass: string;
    description?: string;
}

export const EQUIPMENT_CATEGORIES: CategoryOption[] = [
    {
        value: "THANG_MAY",
        label: "Thang máy",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        description: "Hệ thống thang máy tải khách và hàng",
    },
    {
        value: "MAY_PHAT_DIEN",
        label: "Máy phát điện",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
        description: "Máy phát điện dự phòng tòa nhà",
    },
    {
        value: "PCCC",
        label: "Hệ thống PCCC",
        badgeClass: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        description: "Phòng cháy chữa cháy, bơm chữa cháy, bình cứu hỏa",
    },
    {
        value: "BOM_NUOC",
        label: "Máy bơm nước",
        badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100",
        description: "Bơm tăng áp, bơm cấp nước sinh hoạt, bơm thoát sàn",
    },
    {
        value: "CAMERA_AN_NINH",
        label: "Camera an ninh (CCTV)",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
        description: "Hệ thống giám sát an ninh toàn khu",
    },
    {
        value: "THONG_GIO_DIEU_HOA",
        label: "Thông gió & Điều hòa (HVAC)",
        badgeClass: "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100",
        description: "Hệ thống thông gió tầng hầm, điều hòa trung tâm",
    },
    {
        value: "CHIEU_SANG",
        label: "Hệ thống chiếu sáng",
        badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
        description: "Chiếu sáng công cộng, đèn sự cố, đèn thoát hiểm",
    },
    {
        value: "CONG_BARIE",
        label: "Cổng tự động & Barie",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        description: "Hệ thống kiểm soát ra vào bãi xe và cổng chính",
    },
    {
        value: "XU_LY_NUOC_THAI",
        label: "Xử lý nước thải",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
        description: "Hệ thống bể phốt, vi sinh, thoát nước thải",
    },
    {
        value: "KHAC",
        label: "Thiết bị khác",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
        description: "Các trang thiết bị và công cụ tiện ích khác",
    },
];

export const getCategoryInfo = (categoryKey?: string | null): CategoryOption => {
    if (!categoryKey) {
        return {
            value: "KHAC",
            label: "Không xác định",
            badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
    const found = EQUIPMENT_CATEGORIES.find(
        (c) => c.value.toLowerCase() === categoryKey.toLowerCase()
    );
    if (found) return found;

    return {
        value: categoryKey,
        label: categoryKey,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    };
};

// =====================================================
// FORM VALIDATION SCHEMAS
// =====================================================

export const createEquipmentSchema = z.object({
    equipmentCode: z
        .string()
        .min(1, "Mã thiết bị không được để trống")
        .max(50, "Mã thiết bị tối đa 50 ký tự")
        .trim(),
    equipmentName: z
        .string()
        .min(1, "Tên thiết bị không được để trống")
        .max(255, "Tên thiết bị tối đa 255 ký tự")
        .trim(),
    category: z
        .string()
        .min(1, "Vui lòng chọn hoặc nhập hạng mục thiết bị")
        .max(100, "Hạng mục tối đa 100 ký tự")
        .trim(),
    operationDate: z
        .string()
        .optional()
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Ngày đưa vào vận hành không hợp lệ"
        ),
    description: z
        .string()
        .max(1000, "Mô tả tối đa 1000 ký tự")
        .optional()
        .or(z.literal("")),
});

export type CreateEquipmentFormValues = z.infer<typeof createEquipmentSchema>;

export const updateEquipmentSchema = z.object({
    equipmentCode: z
        .string()
        .min(1, "Mã thiết bị không được để trống")
        .max(50, "Mã thiết bị tối đa 50 ký tự")
        .trim(),
    equipmentName: z
        .string()
        .min(1, "Tên thiết bị không được để trống")
        .max(255, "Tên thiết bị tối đa 255 ký tự")
        .trim(),
    category: z
        .string()
        .min(1, "Vui lòng chọn hoặc nhập hạng mục thiết bị")
        .max(100, "Hạng mục tối đa 100 ký tự")
        .trim(),
    description: z
        .string()
        .max(1000, "Mô tả tối đa 1000 ký tự")
        .optional()
        .or(z.literal("")),
});

export type UpdateEquipmentFormValues = z.infer<typeof updateEquipmentSchema>;
