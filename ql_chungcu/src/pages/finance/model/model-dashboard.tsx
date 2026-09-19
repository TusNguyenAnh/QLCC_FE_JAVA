import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Layers,
  CheckCircle2,
  Settings,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAllBdAPI } from "@/apis/bdAPI.ts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Building } from "@/types/Building.ts";

interface BuildingRatio {
  id: string;
  buildingName?: string;
  financial_ratio: number;
}

interface ModelDashboardProps {
  modelType: "centralized" | "decentralized";
  onUpdateRatio?: (buildings: BuildingRatio[]) => void;
}

export default function ModelDashboard({
  modelType,
  onUpdateRatio,
}: ModelDashboardProps) {
  const isCentralized = modelType === "centralized";
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBuildings, setEditedBuildings] = useState<BuildingRatio[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);

  const getAllBuilding = async () => {
    try {
      const data = await getAllBdAPI();
      setBuildings(data);
      console.log(data);
    } catch (err) {
      // Error đã được xử lý bởi interceptor
    }
  };

  useEffect(() => {
    if (!isCentralized) {
      getAllBuilding();
    }
  }, [isCentralized]);

  // Calculate total percentage when editing
  useEffect(() => {
    if (isEditing) {
      const total = editedBuildings.reduce(
        (sum, b) => sum + (Number(b.financial_ratio) || 0),
        0,
      );
      setTotalPercentage(Math.round(total * 10) / 10);
    }
  }, [editedBuildings, isEditing]);

  const handleStartEdit = () => {
    setEditedBuildings(
      buildings.map((b) => ({
        id: b.id,
        buildingName: b.buildingName,
        financial_ratio: Number(b.financialRatio) || 0,
      })),
    );
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedBuildings([]);
  };

  const handleRatioChange = (id: string, value: string) => {
    setEditedBuildings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, financialRatio: parseFloat(value) || 0 } : b,
      ),
    );
  };

  const handleSaveEdit = async () => {
    if (Math.abs(totalPercentage - 100) < 0.01 && onUpdateRatio) {
      await onUpdateRatio(editedBuildings);
      setIsEditing(false);
      // Gọi lại danh sách để cập nhật dữ liệu mới nhất
      await getAllBuilding();
    }
  };

  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Model Type Card */}
        <Card className="mb-6 shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-4">
              {isCentralized ? (
                <div className="p-4 bg-blue-500 rounded-full shadow-lg">
                  <Layers className="h-10 w-10 text-white" />
                </div>
              ) : (
                <div className="p-4 bg-green-500 rounded-full shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl font-bold">
                    {isCentralized ? "Mô hình tập trung" : "Mô hình phân tán"}
                  </CardTitle>
                  <Badge
                    className={`${
                      isCentralized ? "bg-blue-600" : "bg-green-600"
                    } text-white`}
                  >
                    Đang áp dụng
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed text-gray-700">
                  {isCentralized
                    ? "Quản lý tất cả các khoản thu chi trong một tài khoản duy nhất. Đơn giản và dễ quản lý."
                    : "Quản lý thu chi theo từng tòa nhà với tỉ lệ phân bổ riêng. Chi tiết và chuyên nghiệp."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Buildings List (only for distributed model) */}
        {!isCentralized && buildings && buildings.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách tòa nhà</CardTitle>
                  <CardDescription>
                    Tỉ lệ phân bổ thu/chi cho từng tòa nhà
                  </CardDescription>
                </div>
                {!isEditing && onUpdateRatio && (
                  <Button
                    onClick={handleStartEdit}
                    variant="outline"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Điều chỉnh tỉ lệ
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={!isValid}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isEditing
                ? // View mode
                  buildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <span className="font-medium">
                        {building.buildingName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-base px-3 py-1"
                      >
                        {Number(building.financialRatio).toFixed(1)}%
                      </Badge>
                    </div>
                  ))
                : // Edit mode
                  editedBuildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-center justify-between p-4 border-2 border-blue-300 rounded-lg bg-blue-50"
                    >
                      <span className="font-medium flex-1">
                        {building.buildingName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={building.financial_ratio}
                          onChange={(e) =>
                            handleRatioChange(building.id, e.target.value)
                          }
                          className="w-28 text-right bg-white"
                        />
                        <span className="text-sm font-medium">%</span>
                      </div>
                    </div>
                  ))}

              {/* Total Summary */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border mt-4 ${
                  isEditing
                    ? isValid
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <span className="font-semibold flex items-center gap-2">
                  {isEditing && !isValid ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  Tổng tỉ lệ phân bổ
                </span>
                <Badge
                  className={`text-base px-3 py-1 ${
                    isEditing
                      ? isValid
                        ? "bg-green-600"
                        : "bg-red-600"
                      : "bg-blue-600"
                  } text-white`}
                >
                  {isEditing
                    ? totalPercentage.toFixed(1)
                    : buildings
                        .reduce((sum, b) => sum + Number(b.financialRatio), 0)
                        .toFixed(1)}
                  %
                </Badge>
              </div>

              {/* Validation Alert */}
              {isEditing && !isValid && (
                <Alert className="border-2 border-amber-400 bg-amber-50">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-medium">
                    Tổng tỉ lệ phải bằng 100%. Hiện tại:{" "}
                    {totalPercentage.toFixed(1)}%
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Centralized Model Info */}
        {isCentralized && (
          <Card className="shadow-xl border-2 border-blue-200">
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layers className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Quản lý tập trung
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Tất cả các khoản thu và chi sẽ được quản lý trong một tài
                  khoản duy nhất. Điều này giúp đơn giản hóa việc theo dõi và
                  báo cáo tài chính, phù hợp cho các tổ chức có quy mô nhỏ hoặc
                  cần quản lý đơn giản.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                  <p className="text-sm text-blue-800 font-medium">
                    ✓ Tài khoản duy nhất cho toàn bộ hệ thống
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
