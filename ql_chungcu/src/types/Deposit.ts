export type DepositContract = {
    id: string;
    bank_name: string;
    account_number: string;
    term: number; // in months
    deposit_date: string;
    maturity_date: string;
    interest_rate: number; // interest rate percentage
    money: string; // in VND
    status?: string;
};

export type DepositStats = {
    total_fund: number;
    total_contracts: number;
};

export type DepositFilters = {
    bank_name?: string;
    term?: string;
    deposit_from?: string;
    deposit_to?: string;
    maturity_from?: string;
    maturity_to?: string;
    building_id?: string;
};
