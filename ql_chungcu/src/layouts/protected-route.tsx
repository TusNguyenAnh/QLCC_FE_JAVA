import React, {useContext} from "react";
import {Navigate} from "react-router-dom";
import {AuthContext} from "@/context/AuthContext.tsx";
import {Loader2} from "lucide-react";
import NotFound from "@/layouts/not-found.tsx";

type ComponentProps = {
    children: React.ReactNode;
    permissions?: string[]; // Danh sách permissions được phép truy cập
    requireAll?: boolean; // true: cần tất cả permissions, false: chỉ cần 1 permission
};

export function ProtectedRoute({
                                   children,
                                   permissions = [],
                                   requireAll = false,
                               }: ComponentProps) {
    const {user, hasAnyPermission, hasAllPermissions, loading} = useContext(AuthContext);
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-sm text-muted-foreground">Đang xác thực...</p>
                </div>
            </div>
        );
    }
    // Chưa đăng nhập -> redirect login
    if (!user) return <Navigate to="/login" replace/>;

    // Không yêu cầu permissions -> cho phép truy cập
    if (permissions.length === 0) return <>{children}</>;

    // Kiểm tra permissions
    const hasAccess = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

    // Không có quyền -> hiển thị trang Access Denied
    if (!hasAccess) {
        return (
            <NotFound/>
        );
    }

    return <>{children}</>;
}
