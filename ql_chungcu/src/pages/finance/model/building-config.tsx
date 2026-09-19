import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Info,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BuildingRatio {
  id: string;
  ratio: number;
}

interface BuildingConfigProps {
  buildings?: BuildingRatio[];
  onNext: (buildings: BuildingRatio[]) => void;
  onBack: () => void;
  items: any[];
}

export default function BuildingConfig({
  buildings: initialBuildings,
  onNext,
  onBack,
  items,
}: BuildingConfigProps) {
  const [buildings, setBuildings] = useState<BuildingRatio[]>(
    initialBuildings || [],
  );
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const total = buildings.reduce(
      (sum, b) => sum + (b.ratio || 0),
      0,
    );
    setTotalPercentage(Math.round(total * 10) / 10);
  }, [buildings]);

  const addBuilding = () => {
    const newBuilding: BuildingRatio = {
      id: `temp-${Date.now()}`,
      ratio: 0,
    };
    setBuildings([...buildings, newBuilding]);
  };

  const removeBuilding = (index: number) => {
    if (buildings.length > 1) {
      setBuildings(buildings.filter((_, i) => i !== index));
    }
  };

  const updateBuilding = (
    index: number,
    field: keyof BuildingRatio,
    value: string | number,
  ) => {
    setBuildings(
      buildings.map((b, i) =>
        i === index
          ? {
              ...b,
              [field]:
                field === "id" ? value : parseFloat(value.toString()) || 0,
            }
          : b,
      ),
    );
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Check building names
    buildings.forEach((building, index) => {
      if (!building.id.trim() || building.id.startsWith("temp-")) {
        newErrors[`name_${index}`] = "Vui lòng chọn tòa nhà";
      }
    });

    // Check total percentage
    if (Math.abs(totalPercentage - 100) > 0.01) {
      newErrors.totalPercentage = `Tổng tỉ lệ phải bằng 100%`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext(buildings);
    }
  };

  const isValid =
    Math.abs(totalPercentage - 100) < 0.01 &&
    buildings.every((b) => b.id.trim() && !b.id.startsWith("temp-"));

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Info Alert */}
        <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">Lưu ý quan trọng</CardTitle>
                <CardDescription className="text-base space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    <span className="text-gray-700">
                      Tổng tỉ lệ phân bổ của tất cả các tòa phải bằng{" "}
                      <strong className="text-indigo-600">100%</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      Tỉ lệ này áp dụng cho <strong>cả thu và chi</strong>
                    </span>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Buildings Form */}
        <Card className="shadow-2xl border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-5">
              {buildings.map((building, index) => (
                <Card
                  key={index}
                  className="border-2 border-gray-300 hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <CardContent className="space-y-4 pt-4 flex justify-between gap-2">
                    {/* Building Name */}
                    <div className="space-y-2 flex-1">
                      <Label
                        htmlFor={`name-${index}`}
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Building2 className="h-4 w-4" />
                        Tên tòa nhà <span className="text-red-500">*</span>
                      </Label>

                      <Select
                        value={building.id}
                        onValueChange={(value) =>
                          updateBuilding(index, "id", value)
                        }
                      >
                        <SelectTrigger
                          className={`w-full text-base ${
                            errors[`name_${index}`]
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="Chọn tòa nhà..." />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`name_${index}`] && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {errors[`name_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Percentage Input */}
                    <div className="space-y-2 flex-1">
                      <Label
                        htmlFor={`percentage-${index}`}
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Building2 className="h-4 w-4 text-indigo-600" />
                        Tỉ lệ phân bổ (%){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`percentage-${index}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="0.0"
                        value={building.ratio || ""}
                        onChange={(e) =>
                          updateBuilding(
                            index,
                            "ratio",
                            e.target.value,
                          )
                        }
                        className="text-base border-indigo-200 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500">
                        Tỉ lệ này áp dụng cho cả thu và chi
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      {buildings.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBuilding(index)}
                          className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Building Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addBuilding}
                className="w-full border-dashed border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 py-6 text-base font-semibold transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Thêm tòa nhà
              </Button>
            </div>

            {/* Summary Section */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 shadow-lg">
              <CardContent className="p-6">
                <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  Tổng kết tỉ lệ phân bổ
                </h4>
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-xl shadow-md border-2 border-indigo-300 min-w-[280px]">
                    <div className="text-sm text-gray-600 mb-2 font-medium text-center">
                      Tổng tỉ lệ phân bổ (Thu & Chi)
                    </div>
                    <div
                      className={`text-5xl font-bold mb-2 text-center ${
                        Math.abs(totalPercentage - 100) < 0.01
                          ? "text-indigo-600"
                          : "text-red-600"
                      }`}
                    >
                      {totalPercentage.toFixed(1)}%
                    </div>
                    {Math.abs(totalPercentage - 100) < 0.01 ? (
                      <div className="text-sm text-green-600 font-medium text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Hợp lệ
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 font-medium text-center">
                        ✗ Chưa đạt 100%
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Alert */}
            {!isValid && (
              <Alert className="mt-4 border-2 border-amber-400 bg-amber-50">
                <Info className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800 font-medium">
                  Vui lòng điều chỉnh tỉ lệ sao cho tổng bằng 100%
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            size="lg"
            variant="outline"
            onClick={onBack}
            className="px-8 py-6 text-base font-semibold border-2 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Quay lại
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`px-12 py-6 text-base font-semibold shadow-xl transition-all ${
              isValid
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl hover:scale-105"
                : ""
            }`}
          >
            Hoàn tất
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-10">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-md" />
          <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-md" />
          <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
