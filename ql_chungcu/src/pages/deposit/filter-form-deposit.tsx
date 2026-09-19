import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Card, CardContent} from "@/components/ui/card";
import {Calendar as Cld, ChevronDown, ChevronDownIcon, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {useState} from "react";

const filterSchema = z.object({
    bank_name: z.string().optional(),
    term: z.string().optional(),
    deposit_from: z.date().optional(),
    deposit_to: z.date().optional(),
    maturity_from: z.date().optional(),
    maturity_to: z.date().optional(),
    building_id: z.string().optional(),
});

export type FilterDepositSchema = z.infer<typeof filterSchema>;

interface FilterDepositFormProps {
    onSubmit: (filters: FilterDepositSchema) => void;
    onReset?: () => void;
    buildings?: any[];
    banks?: any[];
}

export function FilterDepositForm({
                                      onSubmit,
                                      onReset,
                                      buildings = [],
                                      banks = [],
                                  }: FilterDepositFormProps) {
    const {
        watch,
        handleSubmit,
        getValues,
        setValue,
        control,
        reset,
        formState: {errors},
    } = useForm<FilterDepositSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            bank_name: "all",
            term: "all",
            deposit_from: undefined,
            deposit_to: undefined,
            maturity_from: undefined,
            maturity_to: undefined,
            building_id: "all",
        },
    });

    const handleReset = () => {
        reset({
            bank_name: "all",
            term: "all",
            deposit_from: undefined,
            deposit_to: undefined,
            maturity_from: undefined,
            maturity_to: undefined,
            building_id: "all",
        });
        if (onReset) {
            onReset();
        }
    };

    const [openDateDepPopover, setOpenDateDepPopover] = useState(false);
    const [openDateMaPopover, setOpenDateMaPopover] = useState(false);
    const [openTimeDepStart, setOpenTimeDepStart] = useState(false);
    const [openTimeDepEnd, setOpenTimeDepEnd] = useState(false);
    const [openTimeMaStart, setOpenTimeMaStart] = useState(false);
    const [openTimeMaEnd, setOpenTimeMaEnd] = useState(false);

    const selectedBank = watch("bank_name");
    const selectedTerm = watch("term");
    const selectedBuildingId = watch("building_id");
    const depositFrom = watch("deposit_from");
    const depositTo = watch("deposit_to");
    const maturityFrom = watch("maturity_from");
    const maturityTo = watch("maturity_to");


    const hasActiveFilters =
        (selectedBank && selectedBank !== "all") ||
        (selectedTerm && selectedTerm !== "all") ||
        (selectedBuildingId && selectedBuildingId !== "all") ||
        depositFrom || depositTo ||
        maturityFrom || maturityTo
    ;

    return (
        <Card className="py-4 bg-white shadow-sm">
            <CardContent className="px-2">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex gap-1.5 items-center">
                        <div>
                            <Controller
                                control={control}
                                name="building_id"
                                render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-8 text-sm text-black font-semibold">
                                            <SelectValue placeholder="Chọn tòa nhà"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tòa nhà</SelectItem>
                                            {buildings.map((building) => (
                                                <SelectItem
                                                    key={building.id}
                                                    value={String(building.id)}
                                                >
                                                    {building.building_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>


                        <div>
                            <Controller
                                control={control}
                                name="bank_name"
                                render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-8 text-sm text-black font-semibold">
                                            <SelectValue placeholder="Chọn ngân hàng"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Ngân hàng</SelectItem>
                                            {banks.map((bank) => (
                                                <SelectItem key={bank.value} value={bank.label}>
                                                    {bank.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                control={control}
                                name="term"
                                render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-8 text-sm text-black font-semibold">
                                            <SelectValue placeholder="Chọn kỳ hạn"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Kỳ hạn</SelectItem>
                                            <SelectItem value="6">6 tháng</SelectItem>
                                            <SelectItem value="12">12 tháng</SelectItem>
                                            <SelectItem value="18">18 tháng</SelectItem>
                                            <SelectItem value="24">24 tháng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                        </div>

                        <Popover
                            open={openDateDepPopover}
                            onOpenChange={setOpenDateDepPopover}
                        >
                            <PopoverTrigger asChild>
                                <Button variant="outline">
                                    <Cld className="mr-1 h-4 w-4"/>
                                    Ngày gửi
                                    <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <div className="flex w-64 flex-col gap-6 p-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-1 flex-col gap-3">
                                            <Label htmlFor="deposit-from" className="px-1">
                                                Từ ngày
                                            </Label>
                                            <Controller
                                                control={control}
                                                name="deposit_from"
                                                render={({field}) => (
                                                    <Popover
                                                        open={openTimeDepStart}
                                                        onOpenChange={setOpenTimeDepStart}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                id="deposit-from"
                                                                className="w-full justify-between font-normal"
                                                            >
                                                                {field.value
                                                                    ? field.value.toLocaleDateString("en-CA")
                                                                    : "Select date"}
                                                                <ChevronDownIcon/>
                                                            </Button>
                                                        </PopoverTrigger>

                                                        <PopoverContent
                                                            className="w-auto overflow-hidden p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                captionLayout="dropdown"
                                                                disabled={
                                                                    getValues("deposit_to")
                                                                        ? {
                                                                            after: new Date(
                                                                                getValues("deposit_to") ?? Date()
                                                                            ),
                                                                        }
                                                                        : false
                                                                }
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setOpenTimeDepStart(false);
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-1 flex-col gap-3">
                                            <Label htmlFor="deposit-to" className="px-1">
                                                Đến ngày
                                            </Label>
                                            <Controller
                                                control={control}
                                                name="deposit_to"
                                                render={({field}) => (
                                                    <Popover
                                                        open={openTimeDepEnd}
                                                        onOpenChange={setOpenTimeDepEnd}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                id="deposit-to"
                                                                className="w-full justify-between font-normal"
                                                            >
                                                                {field.value
                                                                    ? field.value.toLocaleDateString("en-CA")
                                                                    : "Select date"}
                                                                <ChevronDownIcon/>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto overflow-hidden p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                captionLayout="dropdown"
                                                                disabled={
                                                                    getValues("deposit_from")
                                                                        ? {
                                                                            before: new Date(
                                                                                getValues("deposit_from") ??
                                                                                Date()
                                                                            ),
                                                                        }
                                                                        : false
                                                                }
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setOpenTimeDepEnd(false);
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {(depositTo || depositFrom) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() => {
                                                setValue("deposit_to", undefined);
                                                setValue("deposit_from", undefined);
                                                // Đóng popover cha để force re-render
                                                setOpenDateDepPopover(false);
                                            }}
                                            className="w-full text-slate-600 hover:text-slate-900"
                                        >
                                            <X className="mr-2 h-4 w-4"/>
                                            Xóa bộ lọc ngày gửi
                                        </Button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover
                            open={openDateMaPopover}
                            onOpenChange={setOpenDateMaPopover}
                        >
                            <PopoverTrigger asChild>
                                <Button variant="outline">
                                    <Cld className="mr-1 h-4 w-4"/>
                                    Ngày đáo hạn
                                    <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <div className="flex w-64 flex-col gap-6 p-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-1 flex-col gap-3">
                                            <Label htmlFor="maturity-from" className="px-1">
                                                Từ ngày
                                            </Label>
                                            <Controller
                                                control={control}
                                                name="maturity_from"
                                                render={({field}) => (
                                                    <Popover
                                                        open={openTimeMaStart}
                                                        onOpenChange={setOpenTimeMaStart}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                id="maturity-from"
                                                                className="w-full justify-between font-normal"
                                                            >
                                                                {field.value
                                                                    ? field.value.toLocaleDateString("en-CA")
                                                                    : "Select date"}
                                                                <ChevronDownIcon/>
                                                            </Button>
                                                        </PopoverTrigger>

                                                        <PopoverContent
                                                            className="w-auto overflow-hidden p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                captionLayout="dropdown"
                                                                disabled={
                                                                    getValues("maturity_to")
                                                                        ? {
                                                                            after: new Date(
                                                                                getValues("maturity_to") ?? Date()
                                                                            ),
                                                                        }
                                                                        : false
                                                                }
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setOpenTimeMaStart(false);
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-1 flex-col gap-3">
                                            <Label htmlFor="maturity-to" className="px-1">
                                                Đến ngày
                                            </Label>
                                            <Controller
                                                control={control}
                                                name="maturity_to"
                                                render={({field}) => (
                                                    <Popover
                                                        open={openTimeMaEnd}
                                                        onOpenChange={setOpenTimeMaEnd}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                id="maturity-to"
                                                                className="w-full justify-between font-normal"
                                                            >
                                                                {field.value
                                                                    ? field.value.toLocaleDateString("en-CA")
                                                                    : "Select date"}
                                                                <ChevronDownIcon/>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto overflow-hidden p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                captionLayout="dropdown"
                                                                disabled={
                                                                    getValues("maturity_from")
                                                                        ? {
                                                                            before: new Date(
                                                                                getValues("maturity_from") ??
                                                                                Date()
                                                                            ),
                                                                        }
                                                                        : false
                                                                }
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setOpenTimeMaEnd(false);
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {(maturityTo || maturityFrom) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() => {
                                                setValue("maturity_to", undefined);
                                                setValue("maturity_from", undefined);
                                                // Đóng popover cha để force re-render
                                                setOpenDateMaPopover(false);
                                            }}
                                            className="w-full text-slate-600 hover:text-slate-900"
                                        >
                                            <X className="mr-2 h-4 w-4"/>
                                            Xóa bộ lọc ngày gửi
                                        </Button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>


                        <div className="flex gap-1.5">
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-8 px-2 text-xs"
                                >
                                    <X className="mr-1 h-3 w-3"/>
                                    Xóa
                                </Button>
                            )}
                            <Button type="submit" size="sm" className="h-8 px-3 text-xs">
                                Áp dụng
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
