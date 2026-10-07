import {InspectionRecord} from "@/pages/step-module/inspection-record.tsx";
import {ClipboardCheck, type LucideIcon} from "lucide-react";

export const LAY0UT_MODULE: Record<string, string> = {
    INSPECTION_RECORD: "Biên bản hiện trường",
    PROPOSAL: "Tờ trình ban quản lý",
    CONTRACT: "Hợp đồng với nhà thầu",
    INCOMING_ACCEPTANTCE_RECORD: "Biên bản nghiệm thu đầu vào",
    INSTALL_ACCEPTANTCE_RECORD: "Biên bản nghiệm thu lắp đặt",
    PAYMENT_DOCUMENTATION: "Hồ sơ thanh toán",
}

export const VIEW_MODULE: Record<string, React.ComponentType<any>> = {
    INSPECTION_RECORD: InspectionRecord,
    PROPOSAL: InspectionRecord,
    CONTRACT: InspectionRecord,
    INCOMING_ACCEPTANTCE_RECORD: InspectionRecord,
    INSTALL_ACCEPTANTCE_RECORD: InspectionRecord,
    PAYMENT_DOCUMENTATION: InspectionRecord,
}

export const ICON_MODULE: Record<string, LucideIcon > = {
    INSPECTION_RECORD: ClipboardCheck,

}

