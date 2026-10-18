export interface Brief {
    id: string;
    complexId?: string;
    briefName: string;
    type: string;
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BriefPageResponse {
    data: Brief[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export type BriefTypeOption = {
    value: string;
    label: string;
    color: string;
};

export const BRIEF_TYPES: BriefTypeOption[] = [
    {
        value: "QCHD",
        label: "Quy chế hoạt động",
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
    },
    {
        value: "BBCH",
        label: "Biên bản cuộc họp",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
    },
    {
        value: "TT",
        label: "Thông tư",
        color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
    },
    {
        value: "ND",
        label: "Nghị định",
        color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
    },
    {
        value: "QD",
        label: "Quyết định",
        color: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800"
    },
    {
        value: "KHAC",
        label: "Khác",
        color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    },
];

export interface CreateBriefDTO {
    briefName?: string;
    fileName?: string;
    type: string;
    file: File;
}

export interface UpdateBriefDTO {
    briefName?: string;
    fileName?: string;
    type: string;
}

export interface BriefFilter {
    briefName?: string;
    type?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}
