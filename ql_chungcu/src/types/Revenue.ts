export type RevenueApartment = {
    id: string;
    buildingId: string;
    aptNumber: string;
    aptArea: number;
    aptType: string;
    description: string | null;
    status: number;
};

export type Revenue = {
    id: string;
    apartmentId: string;
    apartment: RevenueApartment;
    title: string;
    originalAmount: string;
    amountaid: string;
    remaining: number;
    status: "paid" | "partial" | "unpaid";
    description: string;
    createdBy: string;
    approvedBy: string | null;
    approvedAt: string | null;
};

export type RevenueSummary = {
    totalPaid: number;
    totalExpect: number;
};

export type RevenueListResponse = {
    message: string;
    data: Revenue[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    summary: RevenueSummary;
};

export type RevenueFilters = {
    perPage?: number;
    page?: number;
    apartmentId?: string;
    status?: string;
    year?: string;
    month?: string;
};

export type GenerateMonthlyRevenueRequest = {
    buildingId: string;
    year: number;
    month: number;
};

export type GenerateMonthlyRevenueResponse = {
    message: string;
    data?: any;
};
