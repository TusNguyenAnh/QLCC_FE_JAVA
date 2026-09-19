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
import type {Apt, fillItemApt} from "@/types/Apartment.ts";

interface ComponentProps {
    handleUpdate: (apt: fillItemApt) => void
    handleDelete: (listApt: string[]) => void

}

//Cột là nơi bạn xác định cốt lõi của bảng trông như thế nào. Chúng xác định dữ liệu sẽ được hiển thị, cách định dạng, sắp xếp và lọc dữ liệu.
export const ColumnsApt = ({handleUpdate, handleDelete}: ComponentProps): ColumnDef<Apt>[] => [
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
                                  if (row.original.status == "0") {
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
                      checked={row.original.status == "0" ? row.getIsSelected() : false}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select row"
            />
        ),
    },

    {
        accessorKey: 'aptNumber',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Số căn hộ"/>
        ),

        cell: ({row}) => (
            <div>{row.getValue('aptNumber')}</div>
        ),
    },
    {
        accessorKey: 'floor',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tầng"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('floor')}</div>
        ),
    },

    {
        accessorKey: 'aptType',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Loại căn hộ"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('aptType')}</div>
        ),
    },
    {
        accessorKey: 'grossArea',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Diện tích tim tường"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('grossArea')}</div>
        ),
    },

    {
        accessorKey: 'carpetArea',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Diện tích thông thủy"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('carpetArea')}</div>
        ),
    },


    // {
    //     accessorKey: 'description',
    //     header: ({column}) => (
    //         <DataTableColumnHeader column={column} title="Mô tả"/>
    //     ),
    //     cell: ({row}) => (
    //         <div>{row.getValue('description')}</div>
    //     ),
    // },

    {
        id: 'actions',
        enableHiding: false,
        cell: ({row}) => {
            const aptItemUpdate = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer"
                                disabled={row.original.status != "0"}>
                            <MoreHorizontal/>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Chức năng</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => handleUpdate(aptItemUpdate)}
                        >
                            Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => handleDelete([aptItemUpdate.id])}
                        >
                            Ngưng hoạt động</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
];
