"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {User, MapPin, Clock, CheckCircle, XCircle} from "lucide-react";
import type {Task} from "@/types/Task.ts";
import {formatDate, PRIORITY_COLORS, STATUS} from "@/utils/reply-constant.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import type {listMediaFile} from "@/types/MediaFile.ts";
import {DataMedia} from "@/layouts/media/data-media.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface SendReqDetailProps {
    request: Task;
    mediaFiles?: listMediaFile | null;
    open: boolean;
    setOpen: (open: boolean) => void;
    // type: string;
}

export function SendReqDetail({
                                  request,
                                  open,
                                  setOpen,
                                  mediaFiles,
                              }: SendReqDetailProps) {

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[80vw] h-[90vh]">
                <div className="h-full overflow-y-auto m-3 p-3 space-y-6">
                    {/* Header */}
                    <DialogHeader>
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                {request.taskName}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Mã yêu cầu: {request.id}
                            </p>
                        </div>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    <DialogTitle>
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={PRIORITY_COLORS[request.priorityName]}
                                >
                                    {request.priorityName}
                                </Badge>
                                <Badge variant="outline">{request.typeName}</Badge>
                            </div>
                        </div>
                    </DialogTitle>

                    {/* Basic Info */}
                    <Card className="gap-0">
                        <CardHeader>
                            <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Người gửi</p>
                                        <p className="font-medium">{request.fullname}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Toà nhà</p>
                                        <p className="font-medium">
                                            {request.buildingName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Thời gian gửi
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(request.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card className="gap-0">
                        <CardHeader>
                            <CardTitle className="text-lg">Mô tả chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground leading-relaxed">
                                {request.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Media Files */}
                    <DataMedia mediaFiles={mediaFiles} title="Tệp đính kèm"/>

                    {/*workflow*/}
                    <Card className="gap-0">
                        <CardHeader>
                            <CardTitle className="text-lg">Tiến trình xét duyệt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between pt-4">
                                <TooltipProvider>
                                    <div className={`flex items-center w-full justify-between`}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background cursor-help">
                                                    <CheckCircle className="h-5 w-5 text-green-500"/>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-sm font-medium">Gửi yêu cầu</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Cư dân
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                        <div className={`flex-1 w-full h-0.5 bg-green-500`}/>
                                    </div>

                                    <div
                                        className={`flex items-center w-full justify-between`}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background cursor-help">
                                                    {request.status == STATUS["P"] ? (
                                                        <Clock className="h-5 w-5 text-blue-500 animate-pulse"/>
                                                    ) : request.status == STATUS["R"] ? (
                                                        <XCircle className="h-5 w-5 text-red-500"/>
                                                    ) : request.status == STATUS["A"] ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500"/>
                                                    ) : (
                                                        <div
                                                            className="w-5 h-5 rounded-full border-2 border-muted-foreground"/>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-sm font-medium">
                                                    {request.status == STATUS["P"] ? (
                                                        "Đang xét duyệt"
                                                    ) : request.status == STATUS["R"] ? (
                                                        "Bị từ chối"
                                                    ) : request.status == STATUS["A"] ? (
                                                        "Đã xét duyệt"
                                                    ) : (
                                                        "Không xác định"
                                                    )}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                        <div
                                            className={`flex-1 w-full h-0.5 ${
                                                request.status == STATUS["A"]
                                                    ? "bg-green-500"
                                                    : "bg-muted"
                                            }`}
                                        />
                                    </div>

                                    <div className={`flex items-center w-full justify-between`}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background cursor-help">
                                                    {request.status == STATUS["A"] ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500"/>
                                                    ) : (
                                                        <div
                                                            className="w-5 h-5 rounded-full border-2 border-muted-foreground"/>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-sm font-medium">Hoàn thành</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Thông qua xét duyệt
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
