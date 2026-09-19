"use client"

import {MoreHorizontal, SquareMinus} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {clsx} from "clsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button";
import {DataTableColumnHeader} from "@/layouts/data-table-header.tsx";

import type {ColumnDef} from "@tanstack/react-table"
import type {fillItemOrg, Org} from "@/types/Organization";

interface ComponentProps {
    handleUpdate: (org: fillItemOrg) => void
    handleDelete: (listOrg: string[]) => void
    handleAddMember: (orgId: string, buildingId: string[]) => void
    itemsBd: any[]
}

//Cột là nơi bạn xác định cốt lõi của bảng trông như thế nào. Chúng xác định dữ liệu sẽ được hiển thị, cách định dạng, sắp xếp và lọc dữ liệu.
export const ColumnsOrg = ({
                               handleUpdate,
                               handleDelete,
                               handleAddMember,
                               itemsBd
                           }: ComponentProps): ColumnDef<Org>[] => [
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
        accessorKey: 'orgCode',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Mã đơn vị"/>
        ),

        cell: ({row}) => (
            <div>{row.getValue('orgCode')}</div>
        ),
    },

    {
        accessorKey: 'orgName',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tên đơn vị"/>
        ),
        cell: ({row}) => (
            row.getCanExpand() ?
                (
                    <div
                        className="flex"
                        style={{paddingLeft: row.depth > 0 ? `${row.depth * 40 - 3}px` : ""}}>
                        <SquareMinus
                            onClick={row.getToggleExpandedHandler()}
                            className={clsx(
                                'p-1 pl-0', "cursor-pointer",
                                row.getIsExpanded() ? 'text-black-500' : 'text-gray-500'
                            )}
                        >
                        </SquareMinus>
                        {row.getValue('orgName')}
                    </div>
                ) :
                (
                    <div
                        style={{paddingLeft: row.depth > 0 ? `${row.depth * 40}px` : ""}}>
                        {row.getValue('orgName')}
                    </div>
                )
        ),
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
        accessorKey: 'buildingIds',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Quản trị tòa"/>
        ),
        cell: ({row}) => (
            <div>{(row.getValue('buildingIds') as string[])
                .map(bdId => itemsBd.find(b => b.id === bdId)?.buildingName)
                .filter(Boolean)
                .join(', ')
            }</div>
        ),
    },

    {
        id: 'actions',
        enableHiding: false,
        cell: ({row}) => {
            const orgItemUpdate = row.original
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
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => handleAddMember(orgItemUpdate.id, orgItemUpdate.buildingIds)} // Thêm thành viên: lay key la cac id cua toa nha
                        >
                            Thành viên
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleUpdate(orgItemUpdate)}
                        >
                            Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete([orgItemUpdate.id])}
                        >
                            Ngưng hoạt động
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
];
