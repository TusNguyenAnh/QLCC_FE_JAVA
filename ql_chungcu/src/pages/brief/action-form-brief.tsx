"use client";

import React, {useEffect, useRef, useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet.tsx";
import {
    Loader2,
    UploadCloud,
    FileText,
    X,
    CheckCircle2,
    File as FileIcon,
} from "lucide-react";
import type {Brief} from "@/types/Brief.ts";
import {BRIEF_TYPES} from "@/types/Brief.ts";

const briefFormSchema = z.object({
    briefName: z
        .string()
        .min(1, "Tên hồ sơ không được để trống")
        .max(255, "Tên hồ sơ không được vượt quá 255 ký tự"),
    type: z.string().min(1, "Vui lòng chọn loại hồ sơ"),
});

export type BriefFormSchema = z.infer<typeof briefFormSchema>;

interface ComponentProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    loading: boolean;
    action: "CREATE" | "UPDATE";
    formData: Partial<Brief> | null;
    onSubmit: (data: BriefFormSchema, file: File | null, id?: string) => void;
}

export default function ActionFormBrief({
                                            open,
                                            setOpen,
                                            loading,
                                            action,
                                            formData,
                                            onSubmit,
                                        }: ComponentProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: {errors},
    } = useForm<BriefFormSchema>({
        resolver: zodResolver(briefFormSchema),
        defaultValues: {
            briefName: "",
            type: BRIEF_TYPES[0].value,
        },
    });

    useEffect(() => {
        if (open) {
            if (action === "UPDATE" && formData) {
                reset({
                    briefName: formData.briefName || "",
                    type: formData.type || BRIEF_TYPES[0].value,
                });
                setSelectedFile(null);
                setFileError(null);
            } else {
                reset({
                    briefName: "",
                    type: BRIEF_TYPES[0].value,
                });
                setSelectedFile(null);
                setFileError(null);
            }
        }
    }, [open, action, formData, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFileError(null);

            const currentBriefName = watch("briefName");
            if (!currentBriefName || currentBriefName.trim() === "") {
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                setValue("briefName", nameWithoutExt, {shouldValidate: true});
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFormSubmit = (data: BriefFormSchema) => {
        if (action === "CREATE" && !selectedFile) {
            setFileError("Vui lòng tải lên tệp hồ sơ đính kèm");
            return;
        }

        onSubmit(
            {
                briefName: data.briefName.trim(),
                type: data.type,
            },
            selectedFile,
            formData?.id
        );
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="sm:max-w-[480px] flex flex-col p-0">
                {loading && (
                    <div
                        className="absolute inset-0 z-50 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-7 w-7 animate-spin text-primary"/>
                        <span className="text-sm font-medium">Đang xử lý dữ liệu...</span>
                    </div>
                )}

                <form
                    className="flex flex-col flex-1 h-full"
                    onSubmit={handleSubmit(handleFormSubmit)}
                >
                    <SheetHeader className="p-6 pb-4 border-b border-border/60">
                        <SheetTitle className="text-foreground font-semibold flex items-center gap-2">
                            {action === "CREATE" ? (
                                <>
                                    <span>Thêm mới hồ sơ</span>
                                </>
                            ) : (
                                <>
                                    <span>Cập nhật thông tin hồ sơ</span>
                                </>
                            )}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            {action === "CREATE"
                                ? "Tải lên tệp đính kèm, đặt tên và phân loại hồ sơ để lưu vào hệ thống."
                                : "Chỉnh sửa tên hiển thị và loại hồ sơ lưu trữ."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {action === "CREATE" ? (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-1">
                                    Tệp đính kèm <span className="text-destructive">*</span>
                                </Label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="brief-file-input"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {!selectedFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-primary hover:bg-muted/30 group ${
                                            fileError
                                                ? "border-destructive/60 bg-destructive/5"
                                                : "border-border"
                                        }`}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <UploadCloud className="h-6 w-6"/>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-foreground">
                                                Nhấn để chọn tệp hoặc kéo thả vào đây
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Hỗ trợ: PDF, Word, Excel, CAD, Hình ảnh, ZIP...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="border border-border/80 rounded-xl p-3 bg-muted/20 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="h-5 w-5"/>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="text-sm font-medium truncate text-foreground"
                                                    title={selectedFile.name}
                                                >
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(
                                                        2
                                                    )}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                            onClick={handleRemoveFile}
                                        >
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                )}

                                {fileError && (
                                    <p className="text-xs text-destructive font-medium">
                                        {fileError}
                                    </p>
                                )}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="briefName" className="text-sm font-semibold flex items-center gap-1">
                                Tên hồ sơ <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="briefName"
                                placeholder="Nhập tên mô tả hồ sơ (VD: Bản vẽ hoàn công PCCC)"
                                {...register("briefName")}
                                className={errors.briefName ? "border-destructive" : ""}
                            />
                            {errors.briefName && (
                                <p className="text-xs text-destructive font-medium">
                                    {errors.briefName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-semibold flex items-center gap-1">
                                Loại hồ sơ<span className="text-destructive">*</span>
                            </Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({field}) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger id="type" className="w-full cursor-pointer">
                                            <SelectValue placeholder="Chọn loại hồ sơ"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BRIEF_TYPES.map((item) => (
                                                <SelectItem
                                                    key={item.value}
                                                    value={item.value}
                                                    className="cursor-pointer"
                                                >
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.type && (
                                <p className="text-xs text-destructive font-medium">
                                    {errors.type.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <SheetFooter className="p-4 border-t border-border/60 bg-muted/10 gap-2 sm:gap-2">
                        <Button
                            type="submit"
                            className="cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Đang lưu...
                                </>
                            ) : action === "CREATE" ? (
                                "Tạo mới hồ sơ"
                            ) : (
                                "Lưu cập nhật"
                            )}
                        </Button>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                disabled={loading}
                            >
                                Hủy bỏ
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
