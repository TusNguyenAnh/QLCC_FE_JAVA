"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DepositContract } from "@/types/Deposit.ts";
import { DataTableColumnHeader } from "@/layouts/data-table-header.tsx";
import { formatCurrency } from "@/utils/common.ts";
import { Badge } from "@/components/ui/badge.tsx";

export const ColumnsDeposit = (): ColumnDef<DepositContract>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TT" />
    ),
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const rowIndex = row.index;
      return (
        <div className="text-center">{pageIndex * pageSize + rowIndex + 1}</div>
      );
    },
    size: 50,
  },
  {
    accessorKey: "bank_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BANK NAME" />
    ),
    cell: ({ row }) => {
      const bankName = row.getValue("bank_name") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10">
            <span className="text-xs font-semibold text-primary">
              {bankName.substring(0, 2)}
            </span>
          </div>
          <span className="font-medium">{bankName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "account_contract",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ACCOUNT CONTRACT" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue("account_contract")}
      </div>
    ),
  },
  {
    accessorKey: "term",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TERM" />
    ),
    cell: ({ row }) => {
      const term = row.getValue("term") as number;
      return (
        <div className="text-center">
          <span className="font-medium">{term}</span>
          <span className="text-muted-foreground text-sm ml-1">
            {term === 1 ? "Month" : "Months"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "deposit_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DEPOSIT DATE" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("deposit_date") as string);
      return (
        <div className="text-sm">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "maturity_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MATURITY DATE" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("maturity_date") as string);
      return (
        <div className="text-sm">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "rate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RATE (%)" />
    ),
    cell: ({ row }) => {
      const rate = row.getValue("rate") as number;
      return (
        <div className="text-center">
          <Badge variant="outline" className="font-semibold">
            {rate}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AMOUNT (VNĐ)" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return (
        <div className="text-right font-medium">{formatCurrency(amount)}</div>
      );
    },
  },
];
