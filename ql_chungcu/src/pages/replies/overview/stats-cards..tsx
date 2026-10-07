import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import {Badge} from "@/components/ui/badge.tsx"
import {Clock, CheckCircle, FileText, Trash} from "lucide-react"
import type {ActionSummary} from "@/types/Task.ts";
import {STATUS} from "@/utils/reply-constant.ts";

interface StatsCardsProps {
    taskAction: ActionSummary[] | null
    pendingReviewTotal: number
}

export function StatsCards({taskAction, pendingReviewTotal}: StatsCardsProps) {
    const pendingReview = pendingReviewTotal
    const rejectRequests = taskAction?.find((t) => t.action === STATUS["R"])?.total || 0
    const completedRequests = taskAction?.find((t) => t.action === STATUS["A"])?.total || 0
    const totalRequests = pendingReview + rejectRequests + completedRequests

    const stats = [
        {
            title: "Tổng yêu cầu",
            value: totalRequests,
            icon: FileText,
            description: "Tất cả yêu cầu trong hệ thống",
        },
        {
            title: "Chờ xét duyệt",
            value: pendingReview,
            icon: Clock,
            description: "Yêu cầu cần phê duyệt",
            highlight: pendingReview > 0,
            label: "Cần xử lý"
        },
        {
            title: "Từ chối xét duyệt",
            value: rejectRequests,
            icon: Trash,
            description: "Yêu cầu đã từ chối",
            highlight: rejectRequests > 0,
            label: "Đã từ chối"
        },
        {
            title: "Đã hoàn thành",
            value: completedRequests,
            icon: CheckCircle,
            description: "Yêu cầu đã xử lý xong",
            highlight: completedRequests > 0,
            label: "Hoàn thành"
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4`}/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        {stat.highlight && (
                            <Badge variant="secondary" className="mt-2 bg-accent text-accent-foreground">
                                {stat.label}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
