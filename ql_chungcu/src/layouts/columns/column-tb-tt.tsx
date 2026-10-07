"use client"

import {MoreHorizontal} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button";
import {DataTableColumnHeader} from "@/layouts/data-table-header.tsx";

import type {ColumnDef} from "@tanstack/react-table"
import type {fillItemTt, TaskType} from "@/types/TaskType.ts";

interface ComponentProps {
    handleUpdate: (tt: fillItemTt) => void
    handleDelete: (listTt: string[]) => void

}

//Cột là nơi bạn xác định cốt lõi của bảng trông như thế nào. Chúng xác định dữ liệu sẽ được hiển thị, cách định dạng, sắp xếp và lọc dữ liệu.
export const ColumnsTt = ({handleUpdate, handleDelete}: ComponentProps): ColumnDef<TaskType>[] => [
    {

        id: "select_all",
        header: ({table}) => {
            return (
                <Checkbox className="cursor-pointer"
                          checked={
                              // neu k select all dc sau khi xoa thi bo comment doan tren va thay gia tri isAllSelected
                              table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()
                          }
                          onCheckedChange={(value) => {
                              table.getPrePaginationRowModel().rows.forEach((row) => {
                                  if (row.original.status == 0) {
                                      row.toggleSelected(!!value);
                                  }
                              });
                          }}
                          aria-label="Select all"
                />
            )
        },
        cell: ({row}) => (
            <Checkbox className="cursor-pointer"
                      checked={row.original.status == 0 ? row.getIsSelected() : false}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select row"
            />
        ),
    },

    {
        accessorKey: 'typeName',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Loại yêu cầu"/>
        ),

        cell: ({row}) => (
            <div>{row.getValue('typeName')}</div>
        ),
    },

    {
        accessorKey: 'priority',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Mức độ ưu tiên"/>
        ),
        cell: ({getValue}) => {
            const priority = getValue() as TaskType["priority"];
            return priority?.priorityName ?? "—";
        },
    },

    {
        accessorKey: 'description',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Mô tả"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('description')}</div>
        ),
    },

    {
        id: 'actions',
        enableHiding: false,
        cell: ({row}) => {
            const ttItemUpdate = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer"
                                disabled={row.original.status != 0}>
                            <MoreHorizontal/>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Chức năng</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => handleUpdate(ttItemUpdate)}
                        >
                            Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => handleDelete([ttItemUpdate.id])}
                        >
                            Ngưng hoạt động</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
];
