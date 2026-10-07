"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {useEffect, useState} from "react";
import {
    User,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    Layers,
    Check,
} from "lucide-react";
import type {Task, TaskWorkflow} from "@/types/Task.ts";
import {STATUS} from "@/utils/reply-constant.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type {listMediaFile} from "@/types/MediaFile.ts";
import {LAY0UT_MODULE, VIEW_MODULE} from "@/utils/layout-constant.ts";
import {InspectionRecord} from "@/pages/step-module/inspection-record.tsx";
import {getMediaFileAPI} from "@/apis/mediaFileAPI.ts";
import {getSubject} from "@/utils/auth.ts";

interface RequestDetailsProps {
    request: Task;
    workflow?: TaskWorkflow[] | null;
    onSubmit: (action: string, comment: string, taskId: string, stepOrder: number) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const getStepStatusClasses = (isCurrent?: string) => {
    switch (isCurrent) {
        case STATUS["A"]:
            return "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-600";
        case STATUS["P"]:
            return "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 ring-4 ring-blue-500/20";
        case STATUS["R"]:
            return "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600";
        default:
            return "border-muted-foreground/30 bg-muted/20 text-muted-foreground";
    }
};

const getStepIcon = (isCurrent?: string) => {
    switch (isCurrent) {
        case STATUS["A"]:
            return <CheckCircle className="h-5 w-5"/>;
        case STATUS["P"]:
            return <Clock className="h-5 w-5 animate-pulse"/>;
        case STATUS["R"]:
            return <XCircle className="h-5 w-5"/>;
        default:
            return <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40"/>;
    }
};

export function RequestDetails({
                                   request,
                                   workflow,
                                   onSubmit,
                                   open,
                                   setOpen,
                               }: RequestDetailsProps) {
    const [comment, setComment] = useState("");
    const [workflowGroupedByStep, setWorkflowGroupedByStep] = useState(new Map<number, TaskWorkflow[]>());
    // Trạng thái lưu bước đang được chọn để hiển thị ở 2/3 giao diện bên phải (-1: Gửi yêu cầu, 999: Hoàn tất)
    const [selectedStepOrder, setSelectedStepOrder] = useState<number>(-1);
    const [moduleCode, setModuleCode] = useState<string>("");
    const [mediaFiles, setMediaFiles] = useState<listMediaFile | null>(null);

    const getMediaFile = async (taskWf: TaskWorkflow[] | undefined) => {
        try {
            const $ownerId = taskWf ? taskWf.map((item) => item.id) : [];
            const data = await getMediaFileAPI($ownerId);
            setMediaFiles(data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const workflowGrouped = new Map<number, TaskWorkflow[]>();
        workflow?.forEach((item) => {
            if (workflowGrouped.get(item.stepOrder)) {
                workflowGrouped.get(item.stepOrder)?.push(item);
            } else {
                workflowGrouped.set(item.stepOrder, [item]);
            }
        });
        setWorkflowGroupedByStep(workflowGrouped);

        // Tự động chọn bước đang chờ duyệt (Pending) nếu có, nếu không chọn bước đầu tiên hoặc -1
        if (workflow && workflow.length > 0) {
            const pendingStep = workflow.find((w) => w.action === STATUS["P"]);
            if (pendingStep) {
                getMediaFile(workflowGrouped.get(pendingStep.stepOrder))
                setSelectedStepOrder(pendingStep.stepOrder);
            } else {
                const firstStep = workflow[0]?.stepOrder;
                getMediaFile(workflowGrouped.get(firstStep))
                setSelectedStepOrder(firstStep !== undefined ? firstStep : -1);
            }
        } else {
            setSelectedStepOrder(-1);
        }

    }, [workflow]);

    const isFinalApproved = Boolean(
        workflow &&
        workflow.length > 0 &&
        workflow.every((taskWf) => taskWf.action === STATUS["A"])
    );

    const isFinalRejected = Boolean(
        workflow?.some((w) => w.action === STATUS["R"]) ||
        request.status === STATUS["R"]
    );

    const selectedStepItems = workflowGroupedByStep.get(selectedStepOrder);
    const Component = VIEW_MODULE[moduleCode] || InspectionRecord;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="sm:max-w-[95vw] lg:max-w-[1360px] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header Dialog */}
                <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {request.taskName}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Chi tiết yêu cầu và tiến trình xử lý
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body: Chia cột 1/3 (Tiến trình xét duyệt) và 2/3 (Giao diện theo moduleCode của step) */}
                <div className="flex-1 min-h-0 p-5 overflow-hidden">
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ===================== CỘT 1/3: TIẾN TRÌNH XÉT DUYỆT ===================== */}
                        <div className="lg:col-span-1 h-full flex flex-col overflow-hidden">
                            <Card className="h-full flex flex-col border shadow-sm overflow-hidden">
                                <CardHeader className="pb-3 border-b bg-muted/20 shrink-0">
                                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-primary"/>
                                            Tiến trình xét duyệt
                                        </span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {workflowGroupedByStep.size} bước
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-0">
                                    {/* Bước 1: Gửi yêu cầu */}
                                    <div
                                        className={`flex gap-3.5 p-2 rounded-xl transition-all cursor-pointer ${
                                            selectedStepOrder === -1
                                                ? "bg-primary/5 border border-primary/40 shadow-xs ring-1 ring-primary/20"
                                                : "hover:bg-muted border border-transparent"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-green-500 bg-green-50 dark:bg-green-950/40 text-green-600 shrink-0">
                                                <CheckCircle className="h-4 w-4"/>
                                            </div>
                                            <div className="w-0.5 flex-1 min-h-[32px] my-1 bg-green-500"/>
                                        </div>
                                        <div className="flex-1 pb-3">
                                            <div className="flex items-center justify-between gap-1 flex-wrap">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                    Gửi yêu cầu
                                                    {selectedStepOrder === -1 && (
                                                        <ChevronRight className="h-3.5 w-3.5 text-primary"/>
                                                    )}
                                                </h4>
                                                <Badge variant="outline"
                                                       className="bg-green-50 text-green-700 text-[10px] font-normal py-0 h-5">
                                                    Đã gửi
                                                </Badge>
                                            </div>
                                            <div
                                                className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                <User className="h-3 w-3 text-muted-foreground/70"/>
                                                <span className="font-medium text-foreground/80">
                                                    {request.fullName || "Cư dân"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Các bước xét duyệt trong workflow */}
                                    {Array.from(workflowGroupedByStep.entries()).map(([key, value]) => {
                                        const isPending = value.some((action) => action.action === STATUS["P"]);
                                        const isRejected = value.some((action) => action.action === STATUS["R"]);
                                        const isUnfinished = value.some((action) => action.action === STATUS["U"]);

                                        const isCurrent = isRejected ? STATUS["R"] : isPending ? STATUS["P"] : isUnfinished ? STATUS["U"] : STATUS["A"];
                                        const stepTitle = key === -1 ? "Gửi yêu cầu" : LAY0UT_MODULE[value[0]?.moduleCode];
                                        const isSelected = selectedStepOrder === key;

                                        return (
                                            <div
                                                key={value[0]?.id || key}
                                                onClick={() => {
                                                    if ((isCurrent === STATUS["P"] && key == request.currentStep) || isCurrent === STATUS["A"]) {
                                                        setSelectedStepOrder(key)
                                                        setModuleCode(value[0].moduleCode)
                                                        getMediaFile(value)
                                                    }
                                                }}
                                                className={`flex gap-3.5 p-2 rounded-xl transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary/5 border border-primary/40 shadow-xs ring-1 ring-primary/20"
                                                        : "hover:bg-muted border border-transparent"
                                                }`}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                                                            key <= request.currentStep ?
                                                                getStepStatusClasses(isCurrent) : getStepStatusClasses("default")

                                                        }`}
                                                    >
                                                        {
                                                            key <= request.currentStep ?
                                                                getStepIcon(isCurrent) : getStepIcon("default")
                                                        }
                                                    </div>
                                                    <div
                                                        className={`w-0.5 flex-1 min-h-[32px] my-1 ${
                                                            isCurrent === STATUS["A"] ? "bg-green-500" : "bg-muted"
                                                        }`}
                                                    />
                                                </div>

                                                <div className="flex-1 pb-3">
                                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                            {stepTitle}
                                                            {isSelected && (
                                                                <ChevronRight className="h-3.5 w-3.5 text-primary"/>
                                                            )}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] font-normal py-0 h-5 ${
                                                                isCurrent === STATUS["A"]
                                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                                    : isCurrent === STATUS["P"] && key == request.currentStep
                                                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                        : isCurrent === STATUS["R"]
                                                                            ? "bg-red-50 text-red-700 border-red-200"
                                                                            : "bg-muted/40 text-muted-foreground"
                                                            }`}
                                                        >
                                                            {isCurrent === STATUS["A"] ? "Đã duyệt" : isCurrent === STATUS["P"] ? "Đang xử lý" : isCurrent === STATUS["R"] ? "Từ chối" : "Chưa duyệt"}
                                                        </Badge>
                                                    </div>

                                                    {/* Danh sách người duyệt trong step */}
                                                    <div className="mt-1 space-y-1.5">
                                                        {value.map((item) => {
                                                            return (
                                                                <div key={item.id}
                                                                     className="text-xs text-muted-foreground">
                                                                    <div
                                                                        className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                                        {item.fullname && (
                                                                            <span
                                                                                className="flex items-center gap-1 font-medium text-foreground/80">
                                                                                <User
                                                                                    className="h-3 w-3 text-muted-foreground"/>
                                                                                {item.fullname}
                                                                            </span>
                                                                        )}
                                                                        {item.orgName && (
                                                                            <span
                                                                                className="text-muted-foreground/80 text-[12px]">
                                                                                • {item.orgName}
                                                                            </span>
                                                                        )}

                                                                        {item.action == STATUS["A"] && (
                                                                            <span
                                                                                className="inline-flex items-center gap-1 text-[12px] text-blue-700">
                                                                                <Check
                                                                                    className="h-3 w-3 text-green-700"/>
                                                                            </span>
                                                                        )}

                                                                        {item.action == STATUS["R"] && (
                                                                            <span
                                                                                className="inline-flex items-center gap-1 text-[12px] text-red-700">
                                                                                <XCircle
                                                                                    className="h-3 w-3 text-red-700"/>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                            ;
                                    })}

                                    {/* Bước cuối: Hoàn tất quy trình */}
                                    <div
                                        onClick={() => {
                                            if (isFinalApproved) {
                                                setSelectedStepOrder(999)
                                                getMediaFile(workflow || [])
                                            }
                                        }}
                                        className={`flex gap-3.5 p-2 rounded-xl transition-all cursor-pointer ${
                                            selectedStepOrder === 999
                                                ? "bg-primary/5 border border-primary/40 shadow-xs ring-1 ring-primary/20"
                                                : "hover:bg-muted/40 border border-transparent"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                                                    isFinalApproved
                                                        ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-600"
                                                        : isFinalRejected
                                                            ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600"
                                                            : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                                                }`}
                                            >
                                                {isFinalApproved ? (
                                                    <CheckCircle className="h-4 w-4"/>
                                                ) : isFinalRejected ? (
                                                    <XCircle className="h-4 w-4"/>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40"/>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 pb-1">
                                            <div className="flex items-center justify-between gap-1 flex-wrap">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                    {isFinalRejected ? "Kết thúc quy trình" : "Hoàn tất quy trình"}
                                                    {selectedStepOrder === 999 && (
                                                        <ChevronRight className="h-3.5 w-3.5 text-primary"/>
                                                    )}
                                                </h4>
                                                {isFinalApproved && (
                                                    <Badge variant="outline"
                                                           className="bg-green-50 text-green-700 text-[10px] font-normal py-0 h-5">
                                                        Hoàn thành
                                                    </Badge>
                                                )}
                                                {isFinalRejected && (
                                                    <Badge variant="outline"
                                                           className="bg-red-50 text-red-700 text-[10px] font-normal py-0 h-5">
                                                        Đã từ chối
                                                    </Badge>
                                                )}
                                                {!isFinalApproved && !isFinalRejected && (
                                                    <Badge variant="outline"
                                                           className="bg-muted/40 text-muted-foreground text-[10px] font-normal py-0 h-5">
                                                        Chưa xong
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {isFinalApproved
                                                    ? "Đã duyệt thông qua tất cả các cấp."
                                                    : isFinalRejected
                                                        ? "Dừng lại do bị từ chối."
                                                        : "Chờ hoàn tất tất cả các cấp."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>


                        {/* ===================== CỘT 2/3: GIAO DIỆN THEO MODULE CODE ===================== */}
                        <div className="lg:col-span-2 h-full overflow-y-auto space-y-6 pr-1">
                            {/* Hiển thị giao diện tương ứng theo moduleCode của step đang chọn */}
                            {Component && <Component
                                selectedStepOrder={selectedStepOrder}
                                stepItems={selectedStepItems} // mang các item của step đang chọn
                                request={request} //task request
                                mediaFiles={mediaFiles}
                                onRefreshMedia={() => getMediaFile(selectedStepItems)}
                            />}

                            {/* Form xét duyệt yêu cầu (Nếu ở trạng thái PENDING) */}
                            {workflowGroupedByStep.get(selectedStepOrder)?.find((wf) => {
                                return wf.approverId == getSubject() && wf.action === STATUS["P"];
                            }) && (
                                <Card className="border-primary/30 shadow-sm gap-2">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary"/>
                                            Xét duyệt yêu cầu
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Textarea
                                            className="focus-visible:ring-1 focus-visible:ring-primary focus:outline-none"
                                            placeholder="Nhập ghi chú xét duyệt (bắt buộc khi từ chối)..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => onSubmit("APPROVED", comment, request.id, selectedStepOrder)}
                                                className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                            >
                                                <CheckCircle className="h-4 w-4"/> Phê duyệt
                                            </Button>
                                            <Button
                                                className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                                                onClick={() => onSubmit("REJECTED", comment, request.id, selectedStepOrder)}
                                            >
                                                <XCircle className="h-4 w-4"/> Từ chối
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Lý do từ chối (Nếu ở trạng thái REJECTED) */}
                            {workflowGroupedByStep.get(selectedStepOrder)?.find((wf) => {
                                return wf.approverId == getSubject() && wf.action === STATUS["R"];
                            }) && (
                                <Card className="border-destructive gap-2 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base text-destructive flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4"/>
                                            Lý do từ chối yêu cầu
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                            {workflow?.find((item) => item.level === request.level)?.comment ||
                                                "Không có lý do chi tiết."}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
