export interface Expense {
  id: string;
  title: string;
  category: string;
  originalAmount: string;
  amountPaid: string;
  remaining: number;
  status: string;
  vendor: string;
  description: string;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface ExpenseFilters {
  perPage?: number;
  page?: number;
  category?: string;
  status?: string;
  proposedFrom?: string;
  proposedTo?: string;
  approved?: number;
  buildingId?: string;
}

export interface ExpenseSummary {
  totalPaid: number;
  totalExpect: number;
}
