import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    ArrowLeft,
    Upload,
    File,
    X, Loader2,
} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {createComplexAPI} from "@/apis/complexAPI.ts";
import {toast, Toaster} from "sonner";

const schema = z.object({
    complexName: z.string().min(1, "Tên chung cư không được để trống"),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    totalBuilding: z.number(),
    totalApartment: z.number(),
    nameContact: z.string().min(1, "Tên liên hệ không được để trống"),
    emailContact: z.string().min(1, "Email không được để trống"),
    phoneContact: z.string().min(1, "Số điện thoại liên hệ không được để trống"),
    description: z.string().optional(),
    files: z.array(z.any())
        .optional()
        .refine(
            (files) => !files || files.every(f => f.size < 50 * 1024 * 1024),
            "Mỗi file phải nhỏ hơn 50MB"
        )
})

export type RegisterFormSchema = z.infer<typeof schema>


export const RegisterService: React.FC = () => {
    const navigate = useNavigate();
    const {
        watch,
        register,
        setValue,
        handleSubmit,
        formState: {errors},
    } = useForm<RegisterFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            complexName: "",
            address: "",
            totalBuilding: 1,
            totalApartment: 1,
            nameContact: "",
            emailContact: "",
            description: "",
            phoneContact: "",
            files: [],
        },
    })

    const [loading, setLoading] = useState(false);
    const files = watch("files") || [];


    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("complexName", data.complexName);
            formData.append("address", data.address);
            formData.append("totalBuilding", String(data.totalBuilding));
            formData.append("totalApartment", String(data.totalApartment));
            formData.append("nameContact", data.nameContact);
            formData.append("emailContact", data.emailContact);
            formData.append("phoneContact", data.phoneContact);
            if (data.description) formData.append("description", data.description);

            (data.files || []).forEach((file: any) => formData.append("files[]", file));
            await createComplexAPI(formData);
            toast.success("Đăng ký dịch vụ thành công! Chúng tôi sẽ gửi thông tin qua email cho bạn trong thời gian sớm nhất.");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filesSelect = e.target.files;
        if (filesSelect) {
            const newFiles = Array.from(e.target.files || []);
            const oldFiles = Array.from(files || []);

            // Gộp file cũ và mới lại
            const merged = [...oldFiles, ...newFiles];

            // Cập nhật vào react-hook-form
            setValue("files", merged, {shouldValidate: true});

            // Reset input để có thể chọn cùng 1 file lần nữa
            e.target.value = "";

        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index); // loại file tại index
        setValue("files", newFiles, {shouldValidate: true});
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate("/")}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Quay lại trang chủ
                    </Button>
                </div>

                <Card className="shadow-xl pt-0">
                    <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-900 text-white rounded-t-lg py-6">
                        <CardTitle className="text-3xl font-bold text-center">
                            Đăng ký sử dụng dịch vụ
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-center text-lg">
                            Điền thông tin chung cư của bạn để bắt đầu sử dụng hệ thống quản
                            lý
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 ">
                        <form className="grid gap-4"
                              onSubmit={handleSubmit((data) => {
                                  // Gửi ngược data + id lên cha
                                  onSubmit(data)
                              })}>
                            {/* Thông tin chung cư */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                    Thông tin chung cư
                                </h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="complexName" className="text-base">
                                            <Building2 className="inline mr-2 h-4 w-4"/>
                                            Tên chung cư <span className="text-red-500">*</span>
                                        </Label>

                                        <Input id="complexName" {...register("complexName", {
                                            setValueAs: (value) => value?.trim()
                                        })}
                                               placeholder="Ví dụ: Chung cư Vinhomes Central Park"
                                               autoComplete="complexName" className="h-11"
                                        />
                                        {errors.complexName &&
                                            <p className="text-sm text-red-500">{errors.complexName.message}</p>}

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-base">
                                            <MapPin className="inline mr-2 h-4 w-4"/>
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="address" {...register("address", {
                                            setValueAs: (value) => value?.trim()
                                        })}
                                               placeholder="Số nhà, đường, phường, quận, thành phố"
                                               autoComplete="address" className="h-11"
                                        />
                                        {errors.address &&
                                            <p className="text-sm text-red-500">{errors.address.message}</p>}

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="totalBuilding" className="text-base">
                                            Số lượng tòa nhà
                                        </Label>
                                        <Input
                                            id="totalBuilding" {...register("totalBuilding", {valueAsNumber: true})}
                                            type="number"
                                            placeholder="Ví dụ: 5"
                                            autoComplete="totalBuilding" className="h-11"
                                        />
                                        {errors.totalBuilding &&
                                            <p className="text-sm text-red-500">{errors.totalBuilding.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="totalApartment" className="text-base">
                                            Tổng số căn hộ
                                        </Label>
                                        <Input
                                            id="totalApartment" {...register("totalApartment", {valueAsNumber: true})}
                                            type="number"
                                            placeholder="Ví dụ: 500"
                                            autoComplete="totalApartment" className="h-11"
                                        />
                                        {errors.totalApartment &&
                                            <p className="text-sm text-red-500">{errors.totalApartment.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin người liên hệ */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                    Thông tin người liên hệ
                                </h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nameContact" className="text-base">
                                            <User className="inline mr-2 h-4 w-4"/>
                                            Họ và tên <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="nameContact" {...register("nameContact", {
                                            setValueAs: (value) => value?.trim()
                                        })}
                                               placeholder="Nguyễn Văn A"
                                               autoComplete="nameContact" className="h-11"
                                        />
                                        {errors.nameContact &&
                                            <p className="text-sm text-red-500">{errors.nameContact.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneContact" className="text-base">
                                            <Phone className="inline mr-2 h-4 w-4"/>
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="phoneContact" {...register("phoneContact", {
                                            setValueAs: (value) => value?.trim()
                                        })}
                                               placeholder="0912345678"
                                               autoComplete="phoneContact" className="h-11"
                                        />
                                        {errors.phoneContact &&
                                            <p className="text-sm text-red-500">{errors.phoneContact.message}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="emailContact" className="text-base">
                                            <Mail className="inline mr-2 h-4 w-4"/>
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="emailContact" {...register("emailContact", {
                                            setValueAs: (value) => value?.trim()
                                        })}
                                               type="email"
                                               placeholder="example@email.com"
                                               autoComplete="emailContact" className="h-11"
                                        />
                                        {errors.emailContact &&
                                            <p className="text-sm text-red-500">{errors.emailContact.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base">
                                    Ghi chú / Yêu cầu đặc biệt
                                </Label>
                                <Textarea
                                    id="description"
                                    {...register("description", {
                                        setValueAs: (value) => value?.trim()
                                    })}
                                    placeholder="Mô tả thêm về chung cư hoặc yêu cầu đặc biệt..."
                                    rows={4}
                                    className="resize-none"
                                />
                                {errors.description &&
                                    <p className="text-sm text-red-500">{errors.description.message}</p>}
                            </div>

                            {/* Upload Files */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                    Tài liệu đính kèm
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="files" className="text-base">
                                        <Upload className="inline mr-2 h-4 w-4"/>
                                        Upload Video hoặc Văn bản
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Hỗ trợ: Video (MP4, AVI, MOV), Văn bản (PDF, DOC, DOCX, TXT)
                                    </p>

                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="files"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-gray-400"/>
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click để upload</span>{" "}
                                                    hoặc kéo thả file
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Video hoặc tài liệu (MAX. 100MB)
                                                </p>
                                            </div>
                                            <Input
                                                id="files"
                                                type="file"
                                                className="hidden"
                                                {...register("files")}
                                                multiple
                                                onChange={(e) => {
                                                    handleFileUpload(e); // xử lý merge file
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {errors.files && <p className="text-red-500">{errors.files.message}</p>}

                                    {/* Display uploaded files */}
                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-semibold text-gray-700">
                                                Đã chọn {files.length} file:
                                            </p>
                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <File className="h-5 w-5 text-blue-600 flex-shrink-0"/>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                {loading && (
                                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>Loading...
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold shadow-lg"
                                >
                                    Đăng ký ngay
                                </Button>
                            </div>

                            <p className="text-sm text-gray-500 text-center mt-4">
                                Bằng cách đăng ký, bạn đồng ý với{" "}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Điều khoản sử dụng
                                </a>{" "}
                                và{" "}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Chính sách bảo mật
                                </a>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Toaster position="bottom-left" richColors/>
        </div>
    );
};
