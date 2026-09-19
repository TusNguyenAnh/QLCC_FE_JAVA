import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Combobox} from "@/components/ui/combobox.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

// Định nghĩa schema Zod
const schema = z.object({
    bank_name: z.string().min(1, "Tên ngân hàng không được để trống"),
    building_id: z.string().optional(),
    account_number: z.string().optional(),
    term: z.number().optional(),
    deposit_date: z.string().optional(),
    maturity_date: z.string().optional(),
    interest_rate: z.number().optional(),
    money: z.number().optional(),
});

export type DepositFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    onSubmit: (data: DepositFormSchema) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
    itemsBd: any[];
    itemsBank: any[];
};

export default function DepositForm({
                                        open,
                                        setOpen,
                                        loading,
                                        onSubmit,
                                        itemsBank,
                                        itemsBd,
                                    }: ComponentProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<DepositFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            bank_name: "",
            building_id: "",
            account_number: "",
            deposit_date: "",
            maturity_date: "",
            term: 1,
            interest_rate: 1,
            money: 1,
        },
    });

    useEffect(() => {
        reset({
            bank_name: "",
            building_id: "",
            account_number: "",
            deposit_date: "",
            maturity_date: "",
            term: 1,
            interest_rate: 1,
            money: 1,
        });
    }, [reset]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="sm:max-w-[425px] flex flex-col">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-1"/>
                        Loading...
                    </div>
                )}

                <form
                    className="flex flex-col flex-1 relative"
                    onSubmit={handleSubmit((data) => {
                        // Gửi ngược data + id lên cha
                        console.log(data);
                        onSubmit(data);
                    })}
                >
                    <SheetHeader>
                        <SheetTitle>Thêm mới hợp đồng tiền gửi</SheetTitle>
                        <SheetDescription>
                            Nhập thông tin hợp đồng tiền gửi mới. Nhấn nút lưu để hoàn thành
                            việc thêm mới.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[70vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="bank_name">Tên ngân hàng</Label>
                                <Controller
                                    control={control}
                                    name="bank_name"
                                    render={({field}) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={itemsBank[0]?.value || ""}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full overflow-hidden">
                                                <SelectValue className="truncate" placeholder="Chọn ngân hàng" />
                                            </SelectTrigger>
                                            <SelectContent className="w-full">
                                                {itemsBank.map((item) => (
                                                    <SelectItem className="truncate" key={item.value} value={item.label}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />

                                {errors.bank_name && (
                                    <p className="text-sm text-red-500">
                                        {errors.bank_name.message}
                                    </p>
                                )}

                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="account_number">STK / Hợp đồng tiền gửi</Label>
                                <Input
                                    id="account_number"
                                    {...register("account_number", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                                {errors.account_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.account_number.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="grow grid gap-3">
                                    <Label htmlFor="term">Kỳ hạn (tháng)</Label>
                                    <Input
                                        id="term"
                                        {...register("term", {valueAsNumber: true})}
                                        type="number"
                                        min="1"
                                        max="100"
                                        step="1"
                                    />
                                    {errors.term && (
                                        <p className="text-sm text-red-500">
                                            {errors.term.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grow grid gap-3">
                                    <Label htmlFor="interest_rate">Lãi suất/năm (%)</Label>
                                    <Input
                                        id="interest_rate"
                                        {...register("interest_rate", {valueAsNumber: true})}
                                        type="number"
                                        min="1"
                                        max="20"
                                        step="0.1"
                                    />
                                    {errors.interest_rate && (
                                        <p className="text-sm text-red-500">
                                            {errors.interest_rate.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="grow grid gap-3">
                                    <Label htmlFor="deposit_date">Ngày gửi</Label>
                                    <Input
                                        id="deposit_date"
                                        type="date"
                                        max={new Date().toISOString().split("T")[0]}
                                        {...register("deposit_date")}
                                    />
                                    {errors.deposit_date && (
                                        <p className="text-sm text-red-500">
                                            {errors.deposit_date.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grow grid gap-3">
                                    <Label htmlFor="maturity_date">Ngày đến hạn</Label>
                                    <Input
                                        id="maturity_date"
                                        type="date"
                                        max={new Date().toISOString().split("T")[0]}
                                        {...register("maturity_date")}
                                    />
                                    {errors.maturity_date && (
                                        <p className="text-sm text-red-500">
                                            {errors.maturity_date.message}
                                        </p>
                                    )}
                                </div>
                            </div>


                            <div className="grid gap-3">
                                <Label htmlFor="money">Số tiền (VND)</Label>
                                <Controller
                                    control={control}
                                    name="money"
                                    render={({field}) => (
                                        <Input
                                            id="money"
                                            type="text"
                                            value={
                                                field.value ? field.value.toLocaleString("vi-VN") : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\./g, "");
                                                const numValue = parseInt(value) || 0;
                                                field.onChange(numValue);
                                            }}
                                            placeholder="0"
                                        />
                                    )}
                                />

                                {errors.money && (
                                    <p className="text-sm text-red-500">
                                        {errors.money.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="building_id">Thuộc tòa nhà</Label>
                                <Controller
                                    control={control}
                                    name="building_id"
                                    render={({field}) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={itemsBd[0]?.value || ""}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn tòa nhà"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {itemsBd.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />

                                {errors.building_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.building_id.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="mt-4 absolute bottom-1 w-full">
                        <Button type="submit">Lưu thay đổi</Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline" onClick={() => {
                            }}>
                                Hủy
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
