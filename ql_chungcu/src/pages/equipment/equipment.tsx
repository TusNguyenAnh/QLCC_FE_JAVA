import {useCallback, useEffect, useState} from "react";
import {useDebounce} from "use-debounce";
import {Plus, Trash2, CheckSquare} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {DataPagination} from "@/layouts/pagination/data-pagination.tsx";
import type {EquipmentResponse} from "@/types/Equipment.ts";
import {searchEquipmentAPI} from "@/apis/equipmentAPI.ts";
import {EquipmentFilter} from "./equipment-filter.tsx";
import {EquipmentTable} from "./equipment-table.tsx";
import {EquipmentFormModal} from "./equipment-form-modal.tsx";
import {EquipmentDetailModal} from "./equipment-detail-modal.tsx";
import {EquipmentHistoryModal} from "./equipment-history-modal.tsx";
import {EquipmentDeleteDialog} from "./equipment-delete-dialog.tsx";

export default function EquipmentPage() {
    // Data list & loading
    const [equipments, setEquipments] = useState<EquipmentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Filtering & searching
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword] = useDebounce(keyword, 400);
    const [category, setCategory] = useState("");

    // Pagination
    const [page, setPage] = useState(0); // 0-indexed for backend API
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Row selection for batch operations
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modals state
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EquipmentResponse | null>(null);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedEquipmentForDetail, setSelectedEquipmentForDetail] =
        useState<EquipmentResponse | null>(null);

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedEquipmentForHistory, setSelectedEquipmentForHistory] =
        useState<EquipmentResponse | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<EquipmentResponse[]>([]);

    // --------------------------------------------------
    // Fetch data from API
    // --------------------------------------------------
    const fetchEquipments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await searchEquipmentAPI({
                keyword: debouncedKeyword.trim() || undefined,
                category: category || undefined,
                page,
                size,
            });

            const list = Array.isArray(res)
                ? res
                : res?.data || (res as any)?.content || [];
            setEquipments(list);

            const total = res?.totalElements ?? (res as any)?.total ?? list.length;
            setTotalElements(total);

            const calculatedTotalPages =
                res?.totalPages ?? Math.max(1, Math.ceil(total / size));
            setTotalPages(calculatedTotalPages);
        } catch {
            setEquipments([]);
            setTotalElements(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [debouncedKeyword, category, page, size]);

    // Re-fetch when debounced search or filters change
    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    // Reset to first page when search keyword or category filter changes
    useEffect(() => {
        setPage(0);
        setSelectedIds([]);
    }, [debouncedKeyword, category]);

    // --------------------------------------------------
    // Selection handlers
    // --------------------------------------------------
    const handleToggleSelectAll = () => {
        const currentPageIds = equipments.map((item) => item.id);
        const allSelected = currentPageIds.every((id) => selectedIds.includes(id));

        if (allSelected) {
            // Uncheck all current page items
            setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            // Select all current page items
            const newSelection = Array.from(new Set([...selectedIds, ...currentPageIds]));
            setSelectedIds(newSelection);
        }
    };

    const handleToggleSelectRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
    };

    // --------------------------------------------------
    // Action triggers
    // --------------------------------------------------
    const handleCreateNew = () => {
        setEditingItem(null);
        setFormModalOpen(true);
    };

    const handleEdit = (item: EquipmentResponse) => {
        setEditingItem(item);
        setFormModalOpen(true);
    };

    const handleViewDetail = (item: EquipmentResponse) => {
        setSelectedEquipmentForDetail(item);
        setDetailModalOpen(true);
    };

    const handleViewHistory = (item: EquipmentResponse) => {
        setSelectedEquipmentForHistory(item);
        setHistoryModalOpen(true);
    };

    const handleDeleteSingle = (item: EquipmentResponse) => {
        setItemsToDelete([item]);
        setDeleteDialogOpen(true);
    };

    const handleDeleteBatch = () => {
        const selectedItems = equipments.filter((item) => selectedIds.includes(item.id));
        setItemsToDelete(selectedItems);
        setDeleteDialogOpen(true);
    };

    const handleDeleteSuccess = () => {
        setSelectedIds([]);
        fetchEquipments();
    };

    const handleResetFilter = () => {
        setKeyword("");
        setCategory("");
        setPage(0);
    };

    return (
        <div className="space-y-4">
            {/* Header & Main Page Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 ">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        type="button"
                        onClick={handleCreateNew}
                        size="sm"
                        className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                    >
                        <Plus className="h-4 w-4 mr-1.5"/>
                        Thêm thiết bị mới
                    </Button>
                </div>
            </div>

            {/* Batch Action Banner (Shown when items are selected) */}
            {selectedIds.length > 0 && (
                <div
                    className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 text-blue-900 font-medium">
                        <CheckSquare className="h-4 w-4 text-blue-600"/>
                        <span>
                            Đã chọn <strong className="font-bold">{selectedIds.length}</strong> thiết bị
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSelection}
                            className="h-6 px-2 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                        >
                            Bỏ chọn
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteBatch}
                            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5"/>
                            Xóa các thiết bị đã chọn ({selectedIds.length})
                        </Button>
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <EquipmentFilter
                keyword={keyword}
                onKeywordChange={setKeyword}
                category={category}
                onCategoryChange={setCategory}
                onReset={handleResetFilter}
                totalElements={totalElements}
                isLoading={loading}
            />

            {/* Data Table */}
            <EquipmentTable
                data={equipments}
                isLoading={loading}
                page={page}
                size={size}
                selectedIds={selectedIds}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleSelectRow={handleToggleSelectRow}
                onViewDetail={handleViewDetail}
                onViewHistory={handleViewHistory}
                onEdit={handleEdit}
                onDelete={handleDeleteSingle}
                onCreateNew={handleCreateNew}
            />

            {/* Server-side Pagination */}
            {totalElements > 0 && (
                <DataPagination
                    meta={{
                        page,
                        totalPages,
                        size,
                        totalElements,
                    }}
                    onPageChange={(targetPage1Indexed) => setPage(targetPage1Indexed - 1)}
                    onPerPageChange={(newSize) => {
                        setSize(newSize);
                        setPage(0);
                    }}
                    showPerPageSelector={true}
                    perPageOptions={[10, 20, 50]}
                />
            )}

            {/* Form Modal (Create & Edit) */}
            <EquipmentFormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                editingItem={editingItem}
                onSuccess={fetchEquipments}
            />

            {/* Detail Modal */}
            <EquipmentDetailModal
                open={detailModalOpen}
                onOpenChange={setDetailModalOpen}
                equipmentId={selectedEquipmentForDetail?.id || null}
                initialData={selectedEquipmentForDetail}
                onEdit={handleEdit}
                onViewHistory={handleViewHistory}
            />

            {/* History Modal (Expense / Repair logs) */}
            <EquipmentHistoryModal
                open={historyModalOpen}
                onOpenChange={setHistoryModalOpen}
                equipment={selectedEquipmentForHistory}
            />

            {/* Delete Confirmation Dialog (Single & Batch) */}
            <EquipmentDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                itemsToDelete={itemsToDelete}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
