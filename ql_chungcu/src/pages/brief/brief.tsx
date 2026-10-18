"use client";

import React, {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {useDebounce} from "use-debounce";
import {
    RotateCw,
    Search,
    Trash2,
    Files,
    Filter,
    FileText, Loader2, Eye, Download,
} from "lucide-react";

import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";

import {DataPagination} from "@/layouts/pagination/data-pagination.tsx";
import {BriefList} from "@/pages/brief/brief-list.tsx";

import type {Brief} from "@/types/Brief.ts";
import type {PaginationMeta} from "@/types/Pagination.ts";
import {BRIEF_TYPES} from "@/types/Brief.ts";
import ActionFormBrief, {
    type BriefFormSchema,
} from "@/pages/brief/action-form-brief.tsx";
import {
    getAllBriefsAPI,
    createBriefAPI,
    updateBriefAPI,
    deleteBriefAPI,
} from "@/apis/briefAPI.ts";
import {handleDownload} from "@/utils/common.ts";

export default function Brief() {
    const [briefs, setBriefs] = useState<Brief[]>([]);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Phân trang theo API (giống reply.tsx): page ở FE tính từ 1, API của brief tính từ 0
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 0,
        totalPages: 1,
        size: 10,
        totalElements: 0,
    });
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const requestIdRef = useRef(0); // bỏ qua response cũ khi gọi liên tiếp

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 400);
    const [selectedType, setSelectedType] = useState<string>("ALL");

    const [openForm, setOpenForm] = useState(false);
    const [formAction, setFormAction] = useState<"CREATE" | "UPDATE">("CREATE");
    const [editingBrief, setEditingBrief] = useState<Partial<Brief> | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        id: string;
        briefName: string;
    } | null>(null);

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [viewingBrief, setViewingBrief] = useState<Brief | null>(null);

    const fetchBriefs = async (
        pageNum = page,
        size = perPage,
        kw = debouncedKeyword,
        type = selectedType,
    ) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const result = await getAllBriefsAPI({
                briefName: kw || undefined,
                type: type === "ALL" ? undefined : type,
                page: pageNum - 1,
                size,
                sortBy: "createdAt",
                sortDir: "desc",
            });
            if (requestId !== requestIdRef.current) return;

            // Xóa phần tử cuối của trang > 1 => lùi về trang trước
            if (result.data.length === 0 && pageNum > 1 && result.totalPages > 0) {
                setPage(result.totalPages);
                return fetchBriefs(result.totalPages, size, kw, type);
            }

            setBriefs(result.data);
            setMeta({
                page: result.page ?? pageNum - 1,
                totalPages: result.totalPages,
                size: result.size ?? size,
                totalElements: result.totalElements,
            });
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error("Lỗi khi tải danh sách hồ sơ:", error);
            toast.error("Không thể tải danh sách hồ sơ");
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    };

    // Đổi từ khóa / loại hồ sơ => về trang 1 và gọi lại API (cũng chạy lần đầu khi mount)
    useEffect(() => {
        setPage(1);
        fetchBriefs(1, perPage, debouncedKeyword, selectedType);
    }, [debouncedKeyword, selectedType]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchBriefs(newPage, perPage);
    };

    const handlePerPageChange = (size: number) => {
        setPerPage(size);
        setPage(1);
        fetchBriefs(1, size);
    };

    const handleCreate = () => {
        setEditingBrief(null);
        setFormAction("CREATE");
        setOpenForm(true);
    };

    const handleUpdate = (brief: Brief) => {
        setEditingBrief(brief);
        setFormAction("UPDATE");
        setOpenForm(true);
    };

    const handleView = (brief: Brief) => {
        setViewingBrief(brief);
        setDetailDialogOpen(true);
    };

    const handleDeletePrompt = (id: string, briefName: string) => {
        setItemToDelete({id, briefName});
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteBriefAPI(itemToDelete.id);
            toast.success(`Đã xóa hồ sơ: "${itemToDelete.briefName}"`);
            await fetchBriefs(page, perPage);
        } catch (error) {
            console.error("Lỗi xóa:", error);
            toast.error("Không thể xóa hồ sơ!");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleSubmitForm = async (
        data: BriefFormSchema,
        file: File | null,
        id?: string
    ) => {
        setFormLoading(true);
        try {
            if (formAction === "CREATE") {
                const formData = new FormData();
                formData.append("briefName", data.briefName);
                formData.append("type", data.type);
                if (file) {
                    formData.append("file", file);
                }
                await createBriefAPI(formData);
                toast.success("Thêm mới hồ sơ thành công!");
            } else if (formAction === "UPDATE" && id) {
                await updateBriefAPI(id, {
                    briefName: data.briefName,
                    type: data.type,
                });
                toast.success("Cập nhật thông tin hồ sơ thành công!");
            }
            setOpenForm(false);
            // Thêm mới: về trang 1 (sort createdAt desc); cập nhật: giữ nguyên trang
            if (formAction === "CREATE") setPage(1);
            await fetchBriefs(formAction === "CREATE" ? 1 : page, perPage);
        } catch (error) {
            console.error("Lỗi khi lưu hồ sơ:", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleResetFilter = () => {
        setKeyword("");
        setSelectedType("ALL");
        toast.info("Đã đặt lại bộ lọc");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    onClick={handleCreate}
                    className="gap-2 cursor-pointer shadow-xs"
                >
                    <Files className="h-4 w-4"/>
                    <span>Thêm mới hồ sơ</span>
                </Button>
            </div>


            <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-3">
                <div
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Filter className="h-3.5 w-3.5 text-primary"/>
                    <span>Bộ lọc tìm kiếm</span>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Nhập tên hồ sơ cần tìm..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>

                        <div>
                            <Select
                                value={selectedType}
                                onValueChange={setSelectedType}
                            >
                                <SelectTrigger className="h-9 text-sm cursor-pointer">
                                    <SelectValue placeholder="Tất cả loại hồ sơ"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="cursor-pointer">
                                        Tất cả loại hồ sơ
                                    </SelectItem>
                                    {BRIEF_TYPES.map((t) => (
                                        <SelectItem
                                            key={t.value}
                                            value={t.value}
                                            className="cursor-pointer"
                                        >
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 cursor-pointer text-xs w-full"
                            onClick={handleResetFilter}
                        >
                            <RotateCw className="h-3.5 w-3.5"/>
                            <span>Đặt lại bộ lọc</span>
                        </Button>
                    </div>
                </div>
            </div>

            <BriefList
                briefs={briefs}
                loading={loading}
                page={page}
                perPage={perPage}
                onView={handleView}
                onUpdate={handleUpdate}
                onDelete={handleDeletePrompt}
            />
            {meta.totalPages > 0 && (
                <DataPagination
                    meta={meta}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            )}

            <ActionFormBrief
                open={openForm}
                setOpen={setOpenForm}
                loading={formLoading}
                action={formAction}
                formData={editingBrief}
                onSubmit={handleSubmitForm}
            />

            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary"/>
                            <span>Thông tin chi tiết hồ sơ</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Chi tiết tệp hồ sơ kỹ thuật được lưu trữ trong hệ thống.
                        </DialogDescription>
                    </DialogHeader>

                    {viewingBrief && (
                        <div className="space-y-3 py-2 text-sm">
                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border">
                                <span className="text-xs text-muted-foreground font-medium">
                                    Tên hồ sơ:
                                </span>
                                <span className="font-semibold text-foreground break-all">
                                    {viewingBrief.briefName}
                                </span>
                            </div>

                            {viewingBrief.fileName && (
                                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        Tên file gốc:
                                    </span>
                                    <span className="font-mono text-xs text-foreground break-all">
                                        {viewingBrief.fileName}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-lg bg-muted/20 border border-border">
                                    <span className="text-xs text-muted-foreground block">
                                        Phân loại:
                                    </span>
                                    <span className="font-medium mt-0.5 inline-block">
                                        {BRIEF_TYPES.find(t => t.value === viewingBrief.type)?.label ?? viewingBrief.type}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-muted/20 border border-border">
                                    <span className="text-xs text-muted-foreground block">
                                        Dung lượng:
                                    </span>
                                    <span className="font-mono text-xs mt-0.5 inline-block">
                                        {viewingBrief.fileSize
                                            ? `${(viewingBrief.fileSize / (1024 * 1024)).toFixed(2)} MB`
                                            : "Không rõ"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-lg bg-muted/20 border border-border">
                                    <span className="text-xs text-muted-foreground block">
                                        MIME type:
                                    </span>
                                    <span className="font-mono text-xs mt-0.5 inline-block text-muted-foreground">
                                        {viewingBrief.mimeType ?? "-"}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-muted/20 border border-border">
                                    <span className="text-xs text-muted-foreground block">
                                        Ngày tải lên:
                                    </span>
                                    <span className="text-xs mt-0.5 inline-block text-muted-foreground">
                                        {new Date(viewingBrief.createdAt).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            </div>

                            <Button
                                className="p-4 border-t border-border/60  w-full"
                                variant="default"
                                type="submit"
                                onClick={() => handleDownload(viewingBrief?.fileUrl, viewingBrief?.fileName)}
                            >
                                <Download className="h-4 w-4 mr-1"/>
                                Tải xuống tệp hồ sơ
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5"/>
                            <span>Xác nhận xóa hồ sơ</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2 text-sm text-foreground/80">
                            <p>
                                Bạn có chắc chắn muốn xóa hồ sơ{" "}
                                <strong className="text-foreground">
                                    "{itemToDelete?.briefName}"
                                </strong>
                                ?
                            </p>
                            <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
                                ⚠️ <strong>Lưu ý:</strong> Thao tác này sẽ xóa hồ sơ và file đính kèm trên hệ thống.
                                Không thể khôi phục sau khi xác nhận.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}