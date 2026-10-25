import React, {useState} from "react";
import {toast} from "sonner";
import {Loader2} from "lucide-react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import type {EquipmentResponse} from "@/types/Equipment.ts";
import {deleteEquipmentsAPI} from "@/apis/equipmentAPI.ts";

interface EquipmentDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemsToDelete: EquipmentResponse[];
    onSuccess: () => void;
}

export const EquipmentDeleteDialog: React.FC<EquipmentDeleteDialogProps> = ({
                                                                                open,
                                                                                onOpenChange,
                                                                                itemsToDelete,
                                                                                onSuccess,
                                                                            }) => {
    const [submitting, setSubmitting] = useState(false);
    const count = itemsToDelete.length;
    const isSingle = count === 1;

    const handleDelete = async () => {
        if (count === 0) return;
        setSubmitting(true);
        try {
            const ids = itemsToDelete.map((item) => item.id);
            await deleteEquipmentsAPI(ids);
            toast.success(
                isSingle
                    ? `Đã xóa thiết bị ${itemsToDelete[0].equipmentCode} thành công!`
                    : `Đã xóa thành công ${count} thiết bị đã chọn!`
            );
            onOpenChange(false);
            onSuccess();
        } catch {
            // Handled in axios interceptor
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[460px] p-6">
                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-base font-semibold text-slate-900 m-0">
                        {isSingle
                            ? `Xác nhận xóa thiết bị?`
                            : `Xác nhận xóa ${count} thiết bị đã chọn?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
                        {isSingle ? (
                            <>
                                Bạn có chắc chắn muốn xóa thiết bị{" "}
                                <strong className="text-slate-800">
                                    {itemsToDelete[0]?.equipmentName} ({itemsToDelete[0]?.equipmentCode})
                                </strong>
                                ? Hành động này sẽ chuyển trạng thái thiết bị sang ngưng hoạt động.
                            </>
                        ) : (
                            <>
                                Bạn có chắc chắn muốn xóa hàng loạt{" "}
                                <strong className="text-slate-800">{count} thiết bị</strong> khỏi danh sách quản lý?
                                Hành động này không thể hoàn tác trực tiếp.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex items-center justify-end gap-2">
                    <AlertDialogCancel
                        disabled={submitting}
                        className="text-xs h-9 mt-0"
                    >
                        Hủy bỏ
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={submitting}
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 font-medium shadow-xs"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>
                                Đang xóa...
                            </>
                        ) : (
                            "Xác nhận xóa"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
