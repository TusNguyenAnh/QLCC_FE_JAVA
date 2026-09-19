export type FinancialModel = {
  id: string;
  modelName: string;
  modelCode: string;
  description: string;
  buildingId: string;
  modelType: "revenue" | "expense" | "mixed";
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type FinancialModelItem = {
  id: string;
  modelId: string;
  itemName: string;
  itemCode: string;
  itemType: "revenue" | "expense";
  calculationMethod: "fixed" | "area_based" | "percentage" | "custom";
  baseAmount: number;
  unit: string;
  applyTo: "all" | "specific";
  isMandatory: boolean;
  description: string;
  formula?: string;
  priority: number;
};

export type fillItemFinancialModel = {
  id?: string;
  modelName: string;
  modelCode: string;
  description?: string;
  buildingId?: string;
  modelType: "revenue" | "expense" | "mixed";
  status?: "active" | "inactive" | "draft";
  items?: FinancialModelItem[];
};

export type FinancialModelFilters = {
  perPage?: number;
  page?: number;
  buildingId?: string;
  modelType?: string;
  status?: string;
};
