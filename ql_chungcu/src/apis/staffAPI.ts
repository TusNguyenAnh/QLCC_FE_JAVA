import request from "@/utils/request.ts";
import type {StaffFormSchema} from "@/pages/authorization/user/management/action-form-staff.tsx";

export const createStaffAPI = async (newStaff: StaffFormSchema) => {
    const res = await request.post('/staff', newStaff);
    return res.data;
}