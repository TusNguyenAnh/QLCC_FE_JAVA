import type {listWorkflow} from "@/types/Workflow.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ArrowDown, Edit, Settings, Trash2, Users} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Badge} from "@/components/ui/badge.tsx";

type ComponentProps = {
    selectedWorkflow: listWorkflow | null
}

function DetailWorkflow({selectedWorkflow}: ComponentProps) {
    const uniquePriority = Array.from(
        new Map(
            selectedWorkflow?.taskType.map((t) => [t.priority.priorityName, t])
        ).values()
    );

    return (
        // Chi tiết quy trình
        <div className="lg:col-span-2">
            {selectedWorkflow ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {selectedWorkflow.workflowName}
                                    <Badge variant={selectedWorkflow.status == 0 ? "default" : "secondary"}>
                                        {selectedWorkflow.status == 0 ? "Đang dùng" : "Tạm dừng"}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>{selectedWorkflow.description}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm"
                                    // onClick={() => handleEditWorkflow(selectedWorkflow)}
                                >
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="outline" size="sm"
                                    // onClick={() => handleDeleteWorkflow(selectedWorkflow.id)}
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="levels">
                            <TabsList>
                                <TabsTrigger value="levels">Cấp xét duyệt</TabsTrigger>
                                <TabsTrigger value="conditions">Điều kiện áp dụng</TabsTrigger>
                            </TabsList>

                            <TabsContent value="levels" className="space-y-4">
                                {selectedWorkflow.workflowSteps.map((level, index) => (
                                    <div key={level.id}
                                         className="flex items-start gap-4 p-4 border rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            {index < selectedWorkflow.workflowSteps.length - 1 && (
                                                <ArrowDown className="h-4 w-4 text-muted-foreground mt-2"/>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-foreground">Ban quản trị
                                                cấp {level.orgLevel}</h4>
                                            <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4"/>
                                                    <span>{level.workflowStepApprovers.length}</span>
                                                </div>
                                                <div>Cần: {level.workflowStepApprovers.map((pos: {
                                                    roleDataMapper: {
                                                        id: string,
                                                        complexId: string,
                                                        roleName: string,
                                                        description: string,
                                                    }
                                                }, index) => {
                                                    if (index == level.workflowStepApprovers.length - 1) {
                                                        return pos.roleDataMapper.roleName + " ";
                                                    }
                                                    return pos.roleDataMapper.roleName + ", ";
                                                })}phê duyệt
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="conditions" className="space-y-4">
                                <div>
                                    <label className="font-medium mb-2">Loại yêu cầu đang áp dụng</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedWorkflow.taskType.map((cat) => (
                                            <Badge key={cat.id} variant="secondary">
                                                {cat.typeName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="font-medium mb-2">Mức độ ưu tiên đang áp dụng</label>
                                    <div className="flex flex-wrap gap-2">
                                        {uniquePriority.map((pri) => (
                                            <Badge key={pri.priority.id} variant="secondary">
                                                {pri.priority.priorityName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                            <p className="text-muted-foreground">Chọn một quy trình để xem chi tiết</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DetailWorkflow