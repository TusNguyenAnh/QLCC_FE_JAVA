import React, {createContext, useState, useEffect} from "react";
import {Loader2} from "lucide-react";
import {getProfile} from "@/apis/authAPI.ts";
import {findByIdAPI} from "@/apis/orgAPI.ts";
import {getPermissions, getToken} from "@/utils/auth.ts";
import {findComplexByIdAPI} from "@/apis/complexAPI.ts";

interface AuthContextType {
    user: any | null;
    complex: any | null;
    financeModel: any | null;
    orgManage: any | null;
    permissions: string[];

    setUser: React.Dispatch<React.SetStateAction<any | null>>;
    setComplex: React.Dispatch<React.SetStateAction<any | null>>;
    setFinanceModel: React.Dispatch<React.SetStateAction<any | null>>;
    setOrgManage: React.Dispatch<React.SetStateAction<any | null>>;
    setPermissions: React.Dispatch<React.SetStateAction<string[]>>;

    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoggedIn?: boolean;
    fetchUser?: () => Promise<void>;

    // Helper functions
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    clearAuth: () => void;
}

type ComponentProps = {
    children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export default function AuthProvider({children}: ComponentProps) {
    const [user, setUser] = useState<any | null>(null);
    const [complex, setComplex] = useState<any | null>(null);
    const [orgManage, setOrgManage] = useState<any | null>(null);
    const [financeModel, setFinanceModel] = useState();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true); //  Bắt đầu với true để check token

    const checkPermission = React.useCallback(
        (permission: string) => permissions.includes(permission),
        [permissions]
    );

    const checkAnyPermission = React.useCallback(
        (perms: string[]) => perms.some((p) => permissions.includes(p)),
        [permissions]
    );

    const checkAllPermissions = React.useCallback(
        (perms: string[]) => perms.every((p) => permissions.includes(p)),
        [permissions]
    );

    // function để clear tất cả auth state
    const clearAuth = React.useCallback(() => {
        setUser(null);
        setComplex(null);
        setOrgManage(null);
        setPermissions([]);
        setFinanceModel(undefined);
    }, []);

    const fetchUser = React.useCallback(async () => {
        setLoading(true);
        try {
            const profile = await getProfile();
            if (profile.orgId) {
                const org = await findByIdAPI(profile.orgId);
                setOrgManage(org.id);
            }
            const data = await findComplexByIdAPI(profile.user.complexId);
            setFinanceModel(data.financialModel);
            setUser(profile);
            setComplex(profile.user.complexId);

            // Load permissions from token
            const userPermissions = getPermissions();
            setPermissions(userPermissions);
        } catch {
            clearAuth();
        } finally {
            setLoading(false);
        }
    }, [clearAuth]);

    useEffect(() => {
        const token = getToken();
        if (token) {
            fetchUser(); // Chỉ fetch user nếu có token
        } else {
            setLoading(false); // Không có token thì set loading = false
        }
    }, []); //  Chỉ chạy 1 lần khi mount

    // Memoize context value để tránh re-render không cần thiết
    const contextValue = React.useMemo(
        () => ({
            user,
            loading,
            setLoading,
            setUser,
            fetchUser,
            complex,
            setComplex,
            orgManage,
            setOrgManage,
            permissions,
            setPermissions,
            hasPermission: checkPermission,
            hasAnyPermission: checkAnyPermission,
            hasAllPermissions: checkAllPermissions,
            clearAuth,
            financeModel,
            setFinanceModel,
        }),
        [
            user,
            loading,
            complex,
            orgManage,
            permissions,
            fetchUser,
            checkPermission,
            checkAnyPermission,
            checkAllPermissions,
            clearAuth,
            financeModel,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {loading ? (
                <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
