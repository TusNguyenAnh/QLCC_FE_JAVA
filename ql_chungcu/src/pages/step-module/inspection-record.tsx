import {useEffect, useRef, useState, type ChangeEvent} from "react";
import {FileText, Paperclip, Upload, X} from "lucide-react";
import {toast} from "sonner";
import type {Task, TaskWorkflow} from "@/types/Task.ts";
import {LAY0UT_MODULE} from "@/utils/layout-constant.ts";
import {getModuleIcon} from "@/utils/step-icon-constant.tsx";
import {DataMedia} from "@/layouts/media/data-media.tsx";
import type {listMediaFile} from "@/types/MediaFile.ts";
import {Button} from "@/components/ui/button.tsx";
import {uploadMediaFileAPI} from "@/apis/mediaFileAPI.ts";
import {getSubject} from "@/utils/auth.ts";
import {STATUS} from "@/utils/reply-constant.ts";

interface InspectionRecordProps {
    selectedStepOrder: number;
    stepItems: TaskWorkflow[];
    request: Task;
    mediaFiles?: listMediaFile | null;
    onRefreshMedia?: () => void;
}

const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    return `${Math.round((bytes / Math.pow(1024, i)) * 10) / 10} ${sizes[i]}`;
};

export function InspectionRecord({
                                     selectedStepOrder,
                                     stepItems = [],
                                     request,
                                     mediaFiles,
                                     onRefreshMedia
                                 }: InspectionRecordProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const moduleCode = stepItems[0]?.moduleCode || "";
    const moduleTitle = LAY0UT_MODULE[moduleCode] || `Tổng kết`;

    // Chỉ cho upload khi người duyệt thuộc bước này và chưa phê duyệt (action != STATUS["A"])
    const myItem = stepItems.find((wf) => wf.approverId == getSubject());
    const canUpload = Boolean(myItem && myItem.action === STATUS["P"]);

    // Reset danh sách đã chọn khi đổi bước hoặc đổi yêu cầu
    useEffect(() => {
        setFiles([]);
    }, [selectedStepOrder, request.id]);

    const handleSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        if (picked.length > 0) {
            setFiles((prev) => {
                const isSame = (a: File, b: File) =>
                    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
                return [...prev, ...picked.filter((f) => !prev.some((p) => isSame(p, f)))];
            });
        }
        e.target.value = ""; // cho phép chọn lại cùng một file sau khi xóa
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        try {
            await uploadMediaFileAPI(files, "task", myItem?.id);
            toast.success("Tải tệp lên thành công!");
            setFiles([]);
            onRefreshMedia?.();
        } catch (err) {
            console.log(err);
            toast.error("Tải tệp lên thất bại!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div
                className="border shadow-sm border-b flex items-center justify-between gap-3 flex-wrap p-6 rounded-xl border-primary/30">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10">
                        {getModuleIcon(moduleCode)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="text-base font-semibold">
                                {moduleTitle}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedStepOrder != 999 ?
                                "Bước xét duyệt thứ" + {selectedStepOrder} + "trong tiến trình" : ""
                            }
                        </p>
                    </div>
                </div>
            </div>

            <DataMedia mediaFiles={mediaFiles} title="Tệp đính kèm yêu cầu"/>

            {/* Phần upload tệp đính kèm: chỉ hiển thị khi chưa phê duyệt (action != STATUS["A"]) */}
            {canUpload && (
                <div className="space-y-2 rounded-xl border border-dashed border-primary/30 p-4">
                    <input
                        ref={fileInputRef}
                        id="step-file-input"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleSelectFiles}
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-8 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="h-3.5 w-3.5"/> Đính kèm tệp
                        </Button>
                        {files.length > 0 && (
                            <>
                                <span className="text-xs text-muted-foreground">
                                    {files.length} tệp đã chọn
                                </span>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs ml-auto"
                                    disabled={uploading}
                                    onClick={handleUpload}
                                >
                                    <Upload className="h-3.5 w-3.5"/>
                                    {uploading ? "Đang tải lên..." : "Tải lên"}
                                </Button>
                            </>
                        )}
                    </div>
                    {files.length > 0 && (
                        <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {files.map((file, index) => (
                                <li
                                    key={`${file.name}-${file.size}-${file.lastModified}`}
                                    className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground"/>
                                        <span className="text-sm truncate" title={file.name}>
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveFile(index)}
                                        aria-label={`Xóa tệp ${file.name}`}
                                    >
                                        <X className="h-3.5 w-3.5"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}