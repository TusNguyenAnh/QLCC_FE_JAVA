// src/lib/request.ts
import axios from 'axios';
import {toast} from "sonner";

const version = 'v1';

const request = axios.create({
    baseURL: 'https://api.bqtsoft.vn/api' + version,
    // baseURL: 'http://localhost:8000/api/',
    // baseURL: 'http://api.mbs.id.vn:5173/api',
    // baseURL: 'http://localhost:8080/api/'+ version,
    // baseURL: 'http://api.mbs.id.vn:5173/api/' + version,
    // baseURL: 'http://localhost:8000/api/',

    headers: {
        Accept: 'application/json',

    },
    withCredentials: true, // Đảm bảo gửi cookie với mỗi yêu cầu
});

request.interceptors.request.use(
    (config) => {
        const publicUrls = [
            "/auth/login",
            "/auth/register",
            "/organizations/without-descendants",
            /^\/complex\/filter\/[^/]+$/

        ];

        const path = (config.url ?? "").replace(/^\/api\/v1/, "").split("?")[0];

        const isPublic = publicUrls.some(url => {
                if (url instanceof RegExp) {
                    return url.test(path ?? "");
                }

                return url === path;
            }
        );

        if (!isPublic) {
            const token = localStorage.getItem("access_token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }


        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        if (response && response.data && !response.page) {
            return response.data.result
        }
        return response;
    },
    (error) => {
        handleAxiosStatusCode(error);
        return Promise.reject(error)
    }
);


// Refresh token tự động nếu access token hết hạn
// request.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;
//
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             try {
//                 const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
//                 localStorage.setItem("accessToken", data.accessToken);
//                 originalRequest.headers.UserManagement = `Bearer ${data.accessToken}`;
//                 return api(originalRequest);
//             } catch {
//                 localStorage.removeItem("accessToken");
//                 window.location.href = "/login";
//             }
//         }
//
//         return Promise.reject(error);
//     }
// );


export function handleAxiosStatusCode(error: unknown) {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        switch (status) {
            case 400:
                toast.error(data.message);
                break;

            case 401:
                toast.warning("Unauthorized: " + data.message);
                // Chuyển sang trang đăng nhập hoặc thông báo
                // navigate('/login');
                break;

            case 403:
                toast.warning("Forbidden: " + data.message);
                // Hiển thị lỗi không có quyền
                break;

            case 404:
                toast.warning("Not Found: " + data.message);
                // Hiển thị trang 404
                break;

            case 500:
                toast.error("Server Error: " + data.message);
                // Báo lỗi hệ thống
                break;

            default:
                toast.message('Lỗi: ', {
                    description: data?.message || error.message,
                })
        }
    } else {
        // Lỗi không phải từ axios (ví dụ lỗi JS khác)
        toast("Unexpected error: " + error);
    }
}


export default request;
