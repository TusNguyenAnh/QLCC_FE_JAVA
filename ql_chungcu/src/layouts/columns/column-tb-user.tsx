"use client"

import {Shield} from "lucide-react";

import {Button} from "@/components/ui/button";
import {DataTableColumnHeader} from "@/layouts/data-table-header.tsx";

import type {ColumnDef} from "@tanstack/react-table"
import type {Member} from "@/types/User.ts";
import {Badge} from "@/components/ui/badge.tsx";

interface ComponentProps {
    handleUpdate: (userId: string) => void
}

//Cột là nơi bạn xác định cốt lõi của bảng trông như thế nào. Chúng xác định dữ liệu sẽ được hiển thị, cách định dạng, sắp xếp và lọc dữ liệu.
export const ColumnsUser = ({handleUpdate}: ComponentProps): ColumnDef<Member>[] => [
    {
        accessorKey: 'fullname',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Người dùng"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('fullname')}</div>
        ),
    },

    {
        accessorKey: 'email',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Email"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('email')}</div>
        ),
    },

    {
        accessorKey: 'phoneNumber',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Số điện thoại"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('phoneNumber')}</div>
        ),
    },

    {
        accessorKey: 'status',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Trạng thái"/>
        ),
        cell: ({row}) => (
            <Badge variant={"default"}>
                {"Hoạt động"}
            </Badge>

        ),
    },

    {
        id: 'actions',
        enableHiding: false,
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Vai trò"/>
        ),
        cell: ({row}) => {
            const user = row.original
            return (
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleUpdate(user.id)
                        }}
                >
                    <Shield className="h-4 w-4"/>
                </Button>
            )
        }
    }
];
