"use client";

import { Badge } from "@/components/ui/badge.tsx";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types/Task.ts";
import { formatDate, PRIORITY_COLORS } from "@/utils/reply-constant.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

interface RequestListProps {
  requests: Task[] | null;
  onSelectRequest: (request: Task) => void;
  loading?: boolean;
  type?: string;
}

export function RequestList({
  requests,
  onSelectRequest,
  loading,
}: RequestListProps) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có yêu cầu nào
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-1" />
          Loading...
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người gửi</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Điện thoại liên hệ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{request.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.buildingName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{request.typeName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(request.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border-slate-200 font-semibold ${
                      PRIORITY_COLORS[request.priorityName]
                    }`}
                  >
                    {request.priorityName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{request.phoneNumber}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectRequest(request)}
                  >
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
