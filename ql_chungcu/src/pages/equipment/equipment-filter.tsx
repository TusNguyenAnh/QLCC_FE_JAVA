import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { EQUIPMENT_CATEGORIES } from "./equipment-constants.ts";

interface EquipmentFilterProps {
    keyword: string;
    onKeywordChange: (val: string) => void;
    category: string;
    onCategoryChange: (val: string) => void;
    onReset: () => void;
    totalElements?: number;
    isLoading?: boolean;
}

export const EquipmentFilter: React.FC<EquipmentFilterProps> = ({
    keyword,
    onKeywordChange,
    category,
    onCategoryChange,
    onReset,
}) => {
    const hasActiveFilters = Boolean(keyword.trim() || (category && category !== "all"));

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Search input */}
                <div className="relative min-w-[240px]">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                    <Input
                        type="text"
                        value={keyword}
                        onChange={(e) => onKeywordChange(e.target.value)}
                        placeholder="Tìm kiếm theo mã hoặc tên thiết bị..."
                        className="pl-9 pr-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        aria-label="Tìm kiếm theo mã hoặc tên thiết bị"
                    />
                    {keyword && (
                        <button
                            type="button"
                            onClick={() => onKeywordChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Category select filter */}
                <div>
                    <Select
                        value={category || "all"}
                        onValueChange={(val) => onCategoryChange(val === "all" ? "" : val)}
                    >
                        <SelectTrigger
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                            aria-label="Lọc theo hạng mục thiết bị"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <SelectValue placeholder="Tất cả hạng mục" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả hạng mục</SelectItem>
                            {EQUIPMENT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset button */}
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-10 px-3 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs shrink-0 font-medium"
                        aria-label="Đặt lại bộ lọc"
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Xóa bộ lọc
                    </Button>
                )}
            </div>
        </div>
    );
};
