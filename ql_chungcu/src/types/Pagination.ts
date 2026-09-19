export type PaginationMeta = {
  page: number;
  totalPages: number;
  size: number;
  totalElements: number;
};

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginatedResponse<T> = {
  code: number;
  message: string;
  result: {
    data: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};
