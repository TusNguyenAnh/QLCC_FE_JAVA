import request from "@/utils/request.ts";

export const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(amount));
};

export const formatMediaUrl = (url: string) => {
    if (!url) return "";
    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("blob:") ||
        url.startsWith("data:")
    ) {
        return url;
    }
    const apiBase = request.defaults.baseURL || "http://localhost:8080";
    try {
        const origin = new URL(apiBase, window.location.origin).origin;
        return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
    } catch {
        return `http://localhost:8080${url.startsWith("/") ? url : `/${url}`}`;
    }
};

export const handleDownload = async (url: string, fileName: string) => {
    const fullUrl = formatMediaUrl(url);
    try {
        const token = localStorage.getItem("access_token");
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {headers});
        if (!response.ok) throw new Error("Fetch failed");

        // Ngăn chặn tải file nếu server trả về trang lỗi HTML / SPA fallback
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
            throw new Error("Server trả về HTML thay vì định dạng tệp");
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
        console.error("Lỗi khi tải file qua blob, thử tải trực tiếp:", error);
        const link = document.createElement("a");
        link.href = fullUrl;
        link.download = fileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
