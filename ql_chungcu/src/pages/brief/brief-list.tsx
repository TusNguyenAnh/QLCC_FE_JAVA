"use client";

import {Eye, Loader2, Pencil, Trash2} from "lucide-react";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import type {Brief} from "@/types/Brief.ts";
import {BRIEF_TYPES} from "@/types/Brief.ts";

interface BriefListProps {
    briefs: Brief[] | null;
    loading?: boolean;
    page: number;      // trang hiện tại (bắt đầu từ 1) để tính STT
    perPage: number;
    onView: (brief: Brief) => void;
    onUpdate: (brief: Brief) => void;
    onDelete: (id: string, briefName: string) => void;
}

const formatSize = (bytes?: number) =>
    bytes ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : "-";

export function BriefList({
                              briefs,
                              loading,
                              page,
                              perPage,
                              onView,
                              onUpdate,
                              onDelete,
                          }: BriefListProps) {
    const items = Array.isArray(briefs) ? briefs : [];

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>
                    Loading...
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên hồ sơ</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Dung lượng</TableHead>
                            <TableHead>Ngày tải lên</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Không có hồ sơ nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((brief, index) => (

                                <TableRow key={brief.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="font-semibold">{brief.briefName}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline"
                                               className={BRIEF_TYPES.find((t) => t.value === brief.type)?.color}>
                                            {BRIEF_TYPES.find((t) => t.value === brief.type)?.label ??
                                                brief.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatSize(brief.fileSize)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(brief.createdAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onView(brief)}
                                            >
                                                <Eye className="h-4 w-4 mr-1"/>
                                                Chi tiết
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => onUpdate(brief)}
                                                aria-label="Sửa hồ sơ"
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => onDelete(brief.id, brief.briefName)}
                                                aria-label="Xóa hồ sơ"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
