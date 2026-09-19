import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import type {listWorkflow} from "@/types/Workflow.ts";

type ComponentProps = {
    workflows: listWorkflow[]
    selectedWorkflow: listWorkflow | null
    setSelectedWorkflow: (selectedWorkflow: listWorkflow) => void
}

export function ListWorkflow({workflows, selectedWorkflow, setSelectedWorkflow}: ComponentProps) {

    return (
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách quy trình</CardTitle>
                    <CardDescription>Chọn quy trình để xem chi tiết</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 overflow-auto max-h-[600px]" style={{scrollbarWidth: "none"}}>
                    {workflows.map((workflow) => (
                        <div
                            key={workflow.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedWorkflow?.id === workflow.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedWorkflow(workflow)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">{workflow.workflowName}</h4>
                                <Badge variant={workflow.status == 0 ? "default" : "secondary"}>
                                    {workflow.status == 0 ? "Đang dùng" : "Tạm dừng"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{workflow.workflowSteps.length} cấp</span>
                                <span>•</span>
                                <span>{workflow.taskType.length} loại</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}