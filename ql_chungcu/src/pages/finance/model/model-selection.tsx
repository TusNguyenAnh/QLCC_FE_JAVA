import {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Check, ArrowRight, Box, Boxes} from "lucide-react";

type ModelType = "centralized" | "decentralized" | null;

interface ModelSelectionProps {
    onNext: (modelType: ModelType) => void;
}

export default function ModelSelection({onNext}: ModelSelectionProps) {
    const [selectedModel, setSelectedModel] = useState<ModelType>(null);

    const models = [
        {
            id: "centralized" as const,
            title: "Mô hình tập trung",
            description:
                "Quản lý tất cả các khoản thu chi trong một tài khoản duy nhất. Phù hợp cho tổ chức nhỏ hoặc yêu cầu quản lý đơn giản.",
            icon: Box,
            features: [
                "Đơn giản, dễ quản lý",
                "Tập trung hóa cao",
                "Phù hợp tổ chức nhỏ",
            ],
            color: "blue",
        },
        {
            id: "decentralized" as const,
            title: "Mô hình phân tán",
            description:
                "Quản lý thu chi theo từng tòa nhà với tỉ lệ phân bổ riêng biệt. Phù hợp cho tổ chức lớn với nhiều địa điểm.",
            icon: Boxes,
            features: [
                "Chi tiết, chuyên nghiệp",
                "Linh hoạt, mở rộng cao",
                "Phù hợp tổ chức lớn",
            ],
            color: "green",
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-6xl">
                {/* Model Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {models.map((model) => {
                        const Icon = model.icon;
                        const isSelected = selectedModel === model.id;
                        const borderColor =
                            model.color === "blue" ? "border-blue-500" : "border-green-500";
                        const bgColor =
                            model.color === "blue" ? "bg-blue-500" : "bg-green-500";
                        const lightBgColor =
                            model.color === "blue" ? "bg-blue-50" : "bg-green-50";
                        const checkBgColor =
                            model.color === "blue" ? "bg-blue-500" : "bg-green-500";
                        const hoverBorder =
                            model.color === "blue"
                                ? "hover:border-blue-400"
                                : "hover:border-green-400";

                        return (
                            <Card
                                key={model.id}
                                className={`relative cursor-pointer transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${
                                    isSelected
                                        ? `border-3 ${borderColor} shadow-2xl ${lightBgColor} scale-[1.02]`
                                        : `border-2 border-gray-200 ${hoverBorder}`
                                }`}
                                onClick={() => setSelectedModel(model.id)}
                            >
                                {isSelected && (
                                    <div
                                        className={`absolute -top-4 -right-4 ${checkBgColor} text-white rounded-full p-3 shadow-xl animate-pulse`}
                                    >
                                        <Check className="h-6 w-6" strokeWidth={3}/>
                                    </div>
                                )}

                                <CardHeader className="pb-6">
                                    <div className="flex items-center gap-5 mb-4">
                                        <div
                                            className={`p-4 rounded-2xl ${
                                                isSelected ? bgColor : "bg-gray-200"
                                            } transition-all duration-300 shadow-lg`}
                                        >
                                            <Icon
                                                className={`h-10 w-10 ${
                                                    isSelected ? "text-white" : "text-gray-600"
                                                }`}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">
                                            {model.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-base leading-relaxed text-gray-700">
                                        {model.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm text-gray-600 mb-3">
                                            Đặc điểm nổi bật:
                                        </h4>
                                        {model.features.map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 text-sm"
                                            >
                                                <div
                                                    className={`h-2 w-2 rounded-full ${
                                                        isSelected
                                                            ? model.color === "blue"
                                                                ? "bg-blue-500"
                                                                : "bg-green-500"
                                                            : "bg-gray-400"
                                                    } transition-colors`}
                                                />
                                                <span
                                                    className={`${
                                                        isSelected
                                                            ? "font-medium text-gray-900"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                          {feature}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-center gap-4">
                    <Button
                        size="lg"
                        onClick={() => onNext(selectedModel)}
                        disabled={!selectedModel}
                        className={`px-12 py-6 text-lg font-semibold shadow-xl transition-all duration-300 ${
                            selectedModel
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-105"
                                : ""
                        }`}
                    >
                        Tiếp tục
                        <ArrowRight className="ml-2 h-5 w-5"/>
                    </Button>

                    {!selectedModel && (
                        <p className="text-sm text-gray-500 animate-pulse">
                            Vui lòng chọn một mô hình để tiếp tục
                        </p>
                    )}
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-10">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-md"/>
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300"/>
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300"/>
                </div>

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-red-500">
                        Lưu ý: Bạn không thể thay đổi mô hình đã chọn sau khi hoàn tất thiết lập.
                    </p>
                </div>
            </div>
        </div>
    );
}
