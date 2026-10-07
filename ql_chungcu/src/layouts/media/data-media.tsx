"use client";

import React, {useState, useEffect, useMemo} from "react";
import {
    Image as ImageIcon,
    Video as VideoIcon,
    FileText,
    FileSpreadsheet,
    FileArchive,
    Download,
    Eye,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {cn} from "@/lib/utils";
import type {listMediaFile} from "@/types/MediaFile.ts";

import request from "@/utils/request.ts";

export interface MediaItem {
    id: string;
    name: string;
    url: string;
    ext: string;
    type: "image" | "video" | "document";
    size?: string;
    isLocal?: boolean;
    file?: File;
}

export const formatMediaUrl = (url: string) => {
    if (!url) return "";
    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("blob:") ||
        url.startsWith("data:")
    ) {
        return url;
    }
    const apiBase = request.defaults.baseURL || "http://localhost:8080";
    try {
        const origin = new URL(apiBase, window.location.origin).origin;
        return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
    } catch {
        return `http://localhost:8080${url.startsWith("/") ? url : `/${url}`}`;
    }
};

interface DataMediaProps {
    mediaFiles?: listMediaFile | null;
    title?: string;
    showCard?: boolean;
    imageGridCols?: string;
    videoGridCols?: string;
    documentGridCols?: string;
    maxListHeight?: string;
    className?: string;
}

export function DataMedia({
                              mediaFiles,
                              title = "Tệp đính kèm",
                              showCard = true,
                              maxListHeight = "max-h-[380px]",
                              className,
                          }: DataMediaProps) {
    const [activeTab, setActiveTab] = useState<string>("images");
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
        null
    );
    const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
        null
    );
    const [imageZoom, setImageZoom] = useState(1);
    const [imageRotation, setImageRotation] = useState(0);


    const getFileNameFromUrl = (url: string) => {
        try {
            const cleanUrl = url.split("?")[0];
            const parts = cleanUrl.split("/");
            const decoded = decodeURIComponent(parts[parts.length - 1] || "");
            return decoded || "Tệp đính kèm";
        } catch {
            const parts = url.split("/");
            return parts[parts.length - 1] || "Tệp đính kèm";
        }
    };

    const getFileExtension = (url: string) => {
        const fileName = getFileNameFromUrl(url);
        const parts = fileName.split(".");
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    };

    // Build combined items for each category with formatted URLs
    const allImages = useMemo<MediaItem[]>(() => {
        const remote = (mediaFiles?.image || []).map((rawUrl, idx) => ({
            id: `remote-img-${idx}-${rawUrl}`,
            name: getFileNameFromUrl(rawUrl),
            url: formatMediaUrl(rawUrl),
            ext: getFileExtension(rawUrl).toUpperCase() || "IMG",
            type: "image" as const,
            isLocal: false,
        }));
        return remote;
    }, [mediaFiles?.image]);

    const allVideos = useMemo<MediaItem[]>(() => {
        const remote = (mediaFiles?.video || []).map((rawUrl, idx) => ({
            id: `remote-vid-${idx}-${rawUrl}`,
            name: getFileNameFromUrl(rawUrl),
            url: formatMediaUrl(rawUrl),
            ext: getFileExtension(rawUrl).toUpperCase() || "VIDEO",
            type: "video" as const,
            isLocal: false,
        }));
        return remote;
    }, [mediaFiles?.video]);

    const allDocs = useMemo<MediaItem[]>(() => {
        const remote = (mediaFiles?.application || []).map((rawUrl, idx) => ({
            id: `remote-doc-${idx}-${rawUrl}`,
            name: getFileNameFromUrl(rawUrl),
            url: formatMediaUrl(rawUrl),
            ext: getFileExtension(rawUrl).toUpperCase() || "DOC",
            type: "document" as const,
            isLocal: false,
        }));
        return remote;
    }, [mediaFiles?.application]);

    const totalFiles = allImages.length + allVideos.length + allDocs.length;

    // Set default active tab based on availability
    useEffect(() => {
        if (allImages.length > 0) {
            setActiveTab("images");
        } else if (allVideos.length > 0) {
            setActiveTab("videos");
        } else if (allDocs.length > 0) {
            setActiveTab("documents");
        }
    }, [mediaFiles]);

    const handleZoomIn = () => setImageZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () =>
        setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setImageRotation((prev) => (prev + 90) % 360);
    const resetImageView = () => {
        setImageZoom(1);
        setImageRotation(0);
    };

    const handlePrevImage = () => {
        if (selectedImageIndex !== null && allImages.length > 0) {
            const newIndex =
                selectedImageIndex > 0
                    ? selectedImageIndex - 1
                    : allImages.length - 1;
            setSelectedImageIndex(newIndex);
            resetImageView();
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && allImages.length > 0) {
            const newIndex =
                selectedImageIndex < allImages.length - 1
                    ? selectedImageIndex + 1
                    : 0;
            setSelectedImageIndex(newIndex);
            resetImageView();
        }
    };

    const handlePrevVideo = () => {
        if (selectedVideoIndex !== null && allVideos.length > 0) {
            const newIndex =
                selectedVideoIndex > 0
                    ? selectedVideoIndex - 1
                    : allVideos.length - 1;
            setSelectedVideoIndex(newIndex);
        }
    };

    const handleNextVideo = () => {
        if (selectedVideoIndex !== null && allVideos.length > 0) {
            const newIndex =
                selectedVideoIndex < allVideos.length - 1
                    ? selectedVideoIndex + 1
                    : 0;
            setSelectedVideoIndex(newIndex);
        }
    };

    const handleDownload = async (url: string, fileName: string) => {
        const fullUrl = formatMediaUrl(url);
        try {
            const token = localStorage.getItem("access_token");
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(fullUrl, { headers });
            if (!response.ok) throw new Error("Fetch failed");

            // Ngăn chặn tải file nếu server trả về trang lỗi HTML / SPA fallback
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
                throw new Error("Server trả về HTML thay vì định dạng tệp");
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (error) {
            console.error("Lỗi khi tải file qua blob, thử tải trực tiếp:", error);
            const link = document.createElement("a");
            link.href = fullUrl;
            link.download = fileName;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleView = (item: MediaItem, index: number) => {
        if (item.type === "image") {
            setSelectedImageIndex(index);
            resetImageView();
        } else if (item.type === "video") {
            setSelectedVideoIndex(index);
        } else {
            window.open(item.url, "_blank");
        }
    };

    // Handle mouse wheel zoom for image modal
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (selectedImageIndex !== null) {
                e.preventDefault();
                const delta = e.deltaY;
                if (delta < 0) {
                    setImageZoom((prev) => Math.min(prev + 0.1, 3));
                } else {
                    setImageZoom((prev) => Math.max(prev - 0.1, 0.5));
                }
            }
        };

        if (selectedImageIndex !== null) {
            window.addEventListener("wheel", handleWheel, {passive: false});
        }

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, [selectedImageIndex]);

    const getDocIconConfig = (ext: string) => {
        const normalizedExt = ext.toLowerCase();
        if (normalizedExt === "pdf") {
            return {
                icon: (
                    <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400"/>
                ),
                bg: "bg-rose-50 border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-900/40",
            };
        }
        if (["doc", "docx"].includes(normalizedExt)) {
            return {
                icon: (
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                ),
                bg: "bg-blue-50 border-blue-200/60 dark:bg-blue-950/40 dark:border-blue-900/40",
            };
        }
        if (["xls", "xlsx", "csv"].includes(normalizedExt)) {
            return {
                icon: (
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400"/>
                ),
                bg: "bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/40",
            };
        }
        if (["zip", "rar", "7z", "tar", "gz"].includes(normalizedExt)) {
            return {
                icon: (
                    <FileArchive className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
                ),
                bg: "bg-amber-50 border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-900/40",
            };
        }
        return {
            icon: (
                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400"/>
            ),
            bg: "bg-slate-100 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700",
        };
    };

    const renderEmptyState = (categoryName: string, icon: React.ReactNode) => (
        <div
            className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border/80 rounded-xl bg-muted/20">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                {icon}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
                Chưa có {categoryName} nào
            </p>
        </div>
    );

    const renderItemList = (
        items: MediaItem[],
        categoryName: string,
        emptyIcon: React.ReactNode
    ) => {
        if (items.length === 0) {
            return renderEmptyState(categoryName, emptyIcon);
        }

        return (
            <div
                className={cn(
                    "overflow-y-auto space-y-2 pr-1 scrollbar-thin",
                    maxListHeight
                )}
            >
                {items.map((item, index) => {
                    let iconContainerBg =
                        "bg-muted/80 border-border text-muted-foreground";
                    let iconElement = (
                        <FileText className="h-5 w-5 text-muted-foreground"/>
                    );

                    if (item.type === "image") {
                        iconContainerBg =
                            "bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/40";
                        iconElement = (
                            <ImageIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400"/>
                        );
                    } else if (item.type === "video") {
                        iconContainerBg =
                            "bg-indigo-50 border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-900/40";
                        iconElement = (
                            <VideoIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400"/>
                        );
                    } else {
                        const config = getDocIconConfig(item.ext);
                        iconContainerBg = config.bg;
                        iconElement = config.icon;
                    }

                    return (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/30 hover:border-border transition-all duration-200 gap-3"
                        >
                            <div
                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                onClick={() => handleView(item, index)}
                            >
                                {/* File Icon */}
                                <div
                                    className={cn(
                                        "flex-shrink-0 w-11 h-11 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105",
                                        iconContainerBg
                                    )}
                                >
                                    {iconElement}
                                </div>

                                {/* File Details */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                    <span
                        className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors"
                        title={item.name}
                    >
                      {item.name}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0 font-semibold tracking-wider uppercase h-4"
                                        >
                                            {item.ext || item.type}
                                        </Badge>
                                        {item.size && (
                                            <span className="text-xs text-muted-foreground">
                        {item.size}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 hover:bg-muted"
                                    onClick={() => handleView(item, index)}
                                    title="Xem tệp"
                                >
                                    <Eye className="h-3.5 w-3.5"/>
                                    <span className="hidden sm:inline">Xem</span>
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2.5 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => handleDownload(item.url, item.name)}
                                    title="Tải về máy"
                                >
                                    <Download className="h-3.5 w-3.5"/>
                                    <span className="hidden sm:inline">Tải về</span>
                                </Button>

                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const MediaContent = () => (
        <div className="w-full">

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="images" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4"/>
                        <span>Hình ảnh</span>
                        <Badge
                            variant="secondary"
                            className="ml-1 text-[11px] px-1.5 py-0 h-4.5 rounded-full"
                        >
                            {allImages.length}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger value="videos" className="flex items-center gap-2">
                        <VideoIcon className="h-4 w-4"/>
                        <span>Video</span>
                        <Badge
                            variant="secondary"
                            className="ml-1 text-[11px] px-1.5 py-0 h-4.5 rounded-full"
                        >
                            {allVideos.length}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger value="documents" className="flex items-center gap-2">
                        <FileText className="h-4 w-4"/>
                        <span>Tài liệu</span>
                        <Badge
                            variant="secondary"
                            className="ml-1 text-[11px] px-1.5 py-0 h-4.5 rounded-full"
                        >
                            {allDocs.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="images" className="mt-0 focus-visible:outline-none">
                    {renderItemList(
                        allImages,
                        "hình ảnh",
                        <ImageIcon className="h-6 w-6 text-muted-foreground"/>
                    )}
                </TabsContent>

                <TabsContent value="videos" className="mt-0 focus-visible:outline-none">
                    {renderItemList(
                        allVideos,
                        "video",
                        <VideoIcon className="h-6 w-6 text-muted-foreground"/>
                    )}
                </TabsContent>

                <TabsContent
                    value="documents"
                    className="mt-0 focus-visible:outline-none"
                >
                    {renderItemList(
                        allDocs,
                        "tài liệu",
                        <FolderOpen className="h-6 w-6 text-muted-foreground"/>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <div className={cn("w-full", className)}>
            {showCard ? (
                <Card className="gap-0 border border-border/80 shadow-xs">
                    <CardHeader className="px-6 border-b border-border/60">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                                <span>{title}</span>
                                <Badge
                                    variant="outline"
                                    className="text-xs font-normal px-2 py-0.5"
                                >
                                    {totalFiles} tệp
                                </Badge>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 p-6">
                        <MediaContent/>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">{title}</span>
                            <Badge variant="outline" className="text-xs font-normal">
                                {totalFiles} tệp
                            </Badge>
                        </div>
                    </div>
                    <MediaContent/>
                </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImageIndex !== null && allImages[selectedImageIndex] && (
                <Dialog
                    open={true}
                    onOpenChange={() => {
                        setSelectedImageIndex(null);
                        resetImageView();
                    }}
                >
                    <DialogContent
                        className="max-h-[98vh] p-0 border-0 bg-black/95 max-w-5xl"
                        showCloseButton={false}
                    >
                        <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                            {/* Close Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-6 right-6 z-20 bg-white/90 hover:bg-white border-2 border-gray-200 rounded-full shadow-xl w-11 h-11 transition-all duration-200 hover:scale-110 cursor-pointer"
                                onClick={() => {
                                    setSelectedImageIndex(null);
                                    resetImageView();
                                }}
                            >
                                <X className="h-5 w-5 text-gray-800"/>
                            </Button>

                            {/* Image Counter & Name */}
                            <div
                                className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl flex items-center gap-2 max-w-md">
                <span className="text-xs font-semibold text-gray-700">
                  {selectedImageIndex + 1} / {allImages.length}
                </span>
                                <span className="text-xs text-gray-500 truncate">
                  {allImages[selectedImageIndex].name}
                </span>
                            </div>

                            {/* Zoom Controls + Navigation */}
                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full cursor-pointer"
                                    onClick={handleZoomOut}
                                    disabled={imageZoom <= 0.5}
                                    title="Thu nhỏ"
                                >
                                    <ZoomOut className="h-4 w-4"/>
                                </Button>
                                <span className="text-xs font-semibold min-w-[50px] text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full cursor-pointer"
                                    onClick={handleZoomIn}
                                    disabled={imageZoom >= 3}
                                    title="Phóng to"
                                >
                                    <ZoomIn className="h-4 w-4"/>
                                </Button>

                                <div className="w-px h-5 bg-gray-300 mx-1"/>

                                {allImages.length > 1 && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full cursor-pointer"
                                            onClick={handlePrevImage}
                                            title="Ảnh trước"
                                        >
                                            <ChevronLeft className="h-6 w-6 text-gray-800"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full cursor-pointer"
                                            onClick={handleNextImage}
                                            title="Ảnh tiếp"
                                        >
                                            <ChevronRight className="h-6 w-6 text-gray-800"/>
                                        </Button>
                                    </>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full cursor-pointer"
                                    onClick={handleRotate}
                                    title="Xoay ảnh"
                                >
                                    <RotateCw className="h-4 w-4"/>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-3 rounded-full text-xs font-medium cursor-pointer"
                                    onClick={resetImageView}
                                >
                                    Đặt lại
                                </Button>

                                <div className="w-px h-5 bg-gray-300 mx-1"/>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full cursor-pointer text-gray-800"
                                    onClick={() =>
                                        handleDownload(
                                            allImages[selectedImageIndex].url,
                                            allImages[selectedImageIndex].name
                                        )
                                    }
                                    title="Tải ảnh về"
                                >
                                    <Download className="h-4 w-4"/>
                                </Button>
                            </div>

                            {/* Image element */}
                            <img
                                src={allImages[selectedImageIndex].url}
                                alt={allImages[selectedImageIndex].name}
                                className="max-w-full max-h-[85vh] object-contain transition-all duration-300 select-none"
                                style={{
                                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Video Viewer Modal */}
            {selectedVideoIndex !== null && allVideos[selectedVideoIndex] && (
                <Dialog open={true} onOpenChange={() => setSelectedVideoIndex(null)}>
                    <DialogContent
                        className="max-w-4xl max-h-[95vh] p-6 bg-black/95 border-0 text-white"
                        showCloseButton={false}
                    >
                        <DialogHeader className="pb-3 border-b border-white/10">
                            <div className="flex items-center justify-between pr-8">
                                <DialogTitle className="text-base font-medium text-white truncate max-w-lg">
                                    {allVideos[selectedVideoIndex].name} ({selectedVideoIndex + 1} /{" "}
                                    {allVideos.length})
                                </DialogTitle>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white border-2 border-gray-200 rounded-full shadow-lg w-9 h-9 transition-all duration-200 hover:scale-110 cursor-pointer"
                                    onClick={() => setSelectedVideoIndex(null)}
                                >
                                    <X className="h-4 w-4 text-gray-800"/>
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="w-full mt-3 flex justify-center items-center">
                            <video
                                key={allVideos[selectedVideoIndex].url}
                                src={allVideos[selectedVideoIndex].url}
                                className="w-full max-h-[70vh] rounded-xl shadow-2xl bg-black"
                                controls
                                autoPlay
                            />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            {allVideos.length > 1 ? (
                                <div
                                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-xl">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full cursor-pointer"
                                        onClick={handlePrevVideo}
                                        title="Video trước"
                                    >
                                        <ChevronLeft className="h-5 w-5"/>
                                    </Button>
                                    <span className="text-xs text-white/80 font-medium">
                    {selectedVideoIndex + 1} / {allVideos.length}
                  </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full cursor-pointer"
                                        onClick={handleNextVideo}
                                        title="Video tiếp theo"
                                    >
                                        <ChevronRight className="h-5 w-5"/>
                                    </Button>
                                </div>
                            ) : (
                                <div/>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 h-8 text-xs bg-white text-black hover:bg-white/90"
                                onClick={() =>
                                    handleDownload(
                                        allVideos[selectedVideoIndex].url,
                                        allVideos[selectedVideoIndex].name
                                    )
                                }
                            >
                                <Download className="h-3.5 w-3.5"/>
                                Tải video về
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
