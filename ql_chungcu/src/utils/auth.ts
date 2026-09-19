import {jwtDecode} from "jwt-decode";

export interface DecodedToken {
    iss: string;
    iat: number;
    exp: number;
    nbf: number;
    jti: string;
    sub: string;
    prv: string;
    org_id: string | null;
    scope: string;
    complex_id: string;
}

//Decode JWT token và trả về thông tin
export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};


//Lấy token từ localStorage
export const getToken = (): string | null => {
    return localStorage.getItem("access_token");
};

export const setToken = (token: string): void => {
    localStorage.setItem('access_token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('access_token');
};

//Lấy scope từ token
export const getPermissions = (): string[] => {
    const token = getToken();
    if (!token) return [];

    const decoded = decodeToken(token);
    return decoded?.scope.split(" ") || [];
};


//Kiểm tra user có 1 permission cụ thể không
export const hasPermission = (permission: string): boolean => {
    const scope = getPermissions();
    return scope.includes(permission);
};

//Kiểm tra user có ít nhất 1 trong các permissions không => some() => co 1 thoa man tra ve true
export const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    const userPermissions = getPermissions();
    return requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
    );
};

// Kiểm tra user có tất cả các permissions không
export const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    const userPermissions = getPermissions();
    return requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
    );
};

//Kiểm tra token có hết hạn chưa
export const isTokenExpired = (): boolean => {
    const token = getToken();
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded) return true;

    return decoded.exp * 1000 < Date.now();
};
