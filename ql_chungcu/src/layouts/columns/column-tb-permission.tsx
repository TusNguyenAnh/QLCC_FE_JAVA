"use client"

import {DataTableColumnHeader} from "@/layouts/data-table-header.tsx";

import type {ColumnDef} from "@tanstack/react-table"
import {Badge} from "@/components/ui/badge.tsx";
import type {psItem} from "@/types/Permission.ts";


//Cột là nơi bạn xác định cốt lõi của bảng trông như thế nào. Chúng xác định dữ liệu sẽ được hiển thị, cách định dạng, sắp xếp và lọc dữ liệu.
export const ColumnsPermission = (): ColumnDef<psItem>[] => [
    {
        accessorKey: 'name',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Quyền hạn"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'module',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Danh mục"/>
        ),
        cell: ({row}) => (
            <Badge>
                {row.getValue('module')}
            </Badge>
        ),
    },
    {
        accessorKey: 'totalRoles',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Vai trò"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue('totalRoles')}</div>
        ),
    },
];
