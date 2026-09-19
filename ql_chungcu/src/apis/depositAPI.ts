import request from "@/utils/request.ts";
import type {
    DepositContract,
    DepositStats,
    DepositFilters,
} from "@/types/Deposit.ts";
import type {DepositFormSchema} from "@/pages/deposit/action-form-deposit.tsx";

// Get all deposit contracts with pagination
export const getDepositContractsAPI = async (
    building_id: string,
    page = 1,
    per_page = 10,
    filters?: DepositFilters,
) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            perPage: per_page.toString(),
        });

        if (filters?.bank_name && filters.bank_name !== "all")
            params.append("bank_name", filters.bank_name);
        if (filters?.term && filters.term !== "all")
            params.append("term", filters.term);
        if (filters?.deposit_from)
            params.append("deposit_from", filters.deposit_from);
        if (filters?.deposit_to)
            params.append("deposit_to", filters.deposit_to);
        if (filters?.maturity_from)
            params.append("maturity_from", filters.maturity_from);
        if (filters?.maturity_to)
            params.append("maturity_to", filters.maturity_to);

        const response = await request.get(
            `/money-account/findByBuilding/${building_id}?${params.toString()}`,
        );
        return response;
    } catch (error) {
        console.error("Error fetching deposit contracts:", error);
        throw error;
    }
};

// Get deposit statistics
export const getDepositStatsAPI = async (): Promise<DepositStats> => {
    try {
        const response = await request.get("/deposits/stats");
        return response.data;
    } catch (error) {
        console.error("Error fetching deposit stats:", error);
        throw error;
    }
};

// Create a new deposit contract
export const createDepositAPI = async (newDeposit: DepositFormSchema) => {
    const res = await request.post("/money-account/create", newDeposit);
    return res.data;
};

// Update an existing deposit contract
export const updateDepositContractAPI = async (
    id: number,
    data: Partial<DepositContract>,
): Promise<DepositContract> => {
    try {
        const response = await request.put(`/deposits/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating deposit contract:", error);
        throw error;
    }
};

// Delete a deposit contract
export const deleteDepositContractAPI = async (id: number): Promise<void> => {
    try {
        await request.delete(`/deposits/${id}`);
    } catch (error) {
        console.error("Error deleting deposit contract:", error);
        throw error;
    }
};

export const getBanks = async () => {
    const res = await request.get(`/bd`);
    return res.data;
};
