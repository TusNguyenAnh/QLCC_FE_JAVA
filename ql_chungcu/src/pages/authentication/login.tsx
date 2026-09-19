import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Controller, useForm} from "react-hook-form";
import {useContext, useEffect, useState} from "react";
import {toast, Toaster} from "sonner";
import {Loader2} from "lucide-react";
import {getProfile, login} from "@/apis/authAPI.ts";
import {useNavigate} from "react-router-dom";
import {findByIdAPI, getAllOrgWithoutChildAPI} from "@/apis/orgAPI.ts";
import {getPermissions, setToken} from "@/utils/auth.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {Combobox} from "@/components/ui/combobox.tsx";
import {filterComplexAPI, findComplexByIdAPI} from "@/apis/complexAPI.ts";
import type {cplItemCheckbox} from "@/types/Complex.ts";
import type {orgWithoutChild} from "@/types/Organization.ts";

// Định nghĩa schema Zod
const schema = z.object({
    username: z.string().min(1, "Tên đăng nhập không được để trống"),
    passwordRaw: z.string().min(1, "Mật khẩu không được để trống"),
    complexId: z.string().min(1, "Chung cư không được để trống"),
    orgId: z.string().optional(),
});

export type LoginFormSchema = z.infer<typeof schema>;

export function Login() {
    const {
        register,
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: "",
            passwordRaw: "",
            complexId: "",
            orgId: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [listComplex, setListComplex] = useState([]);
    const [listOrgWithoutChild, setListOrgWithoutChild] = useState([]);

    const navigate = useNavigate();
    const {
        user,
        setUser,
        setComplex,
        setOrgManage,
        setPermissions,
        clearAuth,
        setFinanceModel,
    } = useContext(AuthContext);

    const getAllComplex = async () => {
        try {
            const data = await filterComplexAPI("1");

            const items = data.map(function (item: cplItemCheckbox) {
                return {
                    value: item.id,
                    label: item.complexName,
                };
            });
            setListComplex(items);
        } catch (err) {
            console.log(err);
        }
    };

    const getAllOrgWithoutChild = async (orgId: string, complexId: string) => {
        try {
            const data = await getAllOrgWithoutChildAPI(orgId, complexId);

            const items = data.map(function (item: orgWithoutChild) {
                return {
                    value: item.id,
                    label: item.orgName,
                };
            });
            setListOrgWithoutChild(items);
        } catch (err) {
            console.log(err);
        }
    };

    const onSubmit = async (data: LoginFormSchema) => {
        setLoading(true);
        try {
            // Clear auth cũ trước khi login mới
            clearAuth();

            // Chuyển orgId từ null thành ""
            if (data.orgId == "null" || data.orgId === undefined) {
                data.orgId = "";
            }

            const loginRes = await login(data);
            setToken(loginRes.accessToken);
            const userInfo = await getProfile();
            if (userInfo.orgId) {
                setOrgManage(userInfo.orgId);
            } else {
                setOrgManage(null);
            }
            const dataComplex = await findComplexByIdAPI(userInfo.user.complexId);
            setFinanceModel(dataComplex.financialModel);
            setUser(userInfo);
            setComplex(userInfo.user.complexId);

            // Load permissions from token after login
            const userPermissions = getPermissions();
            setPermissions(userPermissions);

            toast.success("Đăng nhập thành công!");
            navigate("/page/dashboard");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllComplex();
    }, []);

    useEffect(() => {
        if (user) {
            navigate("/page/dashboard");
        }
    }, [user, navigate]);

    if (user) return null;

    return (
        <div
            className="flex items-center justify-center min-h-screen"
            style={{
                backgroundColor: `color-mix(in oklab, var(--color-black) 50%, transparent)`,
            }}
        >
            <Card className="w-full max-w-sm">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>
                        Loading...
                    </div>
                )}

                <form
                    className="grid gap-4"
                    onSubmit={handleSubmit((data: LoginFormSchema) => {
                        // Gửi ngược data + id lên cha
                        onSubmit(data);
                    })}
                >
                    <CardHeader>
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>
                            Enter your username below to login to your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>

                                <Input
                                    id="username"
                                    {...register("username", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                    autoComplete="username"
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-500">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="passwordRaw">Password</Label>
                                    <a
                                        href="#"
                                        tabIndex={-1}
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline tab"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="passwordRaw"
                                    {...register("passwordRaw", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                    type="password"
                                    autoComplete="current-password"
                                />
                                {errors.passwordRaw && (
                                    <p className="text-sm text-red-500">
                                        {errors.passwordRaw.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="complexId">Chung cư</Label>
                                <Controller
                                    control={control}
                                    name="complexId"
                                    render={({field}) => (
                                        <Combobox
                                            items={listComplex}
                                            onChange={(value) => {
                                                field.onChange(value);
                                                if (value) {
                                                    getAllOrgWithoutChild(
                                                        "00000000-0000-0000-0000-000000000000",
                                                        value,
                                                    );
                                                } else {
                                                    setListOrgWithoutChild([]); // Reset danh sách tòa nhà khi không chọn đơn vị cha
                                                }
                                            }}
                                            itemUpdate={""}
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="orgId">Trực thuộc</Label>
                                <Controller
                                    control={control}
                                    name="orgId"
                                    render={({field}) => (
                                        <Combobox
                                            items={listOrgWithoutChild}
                                            onChange={(value) => field.onChange(value)}
                                            itemUpdate={""}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <Toaster position="bottom-left" richColors/>
        </div>
    );
}
