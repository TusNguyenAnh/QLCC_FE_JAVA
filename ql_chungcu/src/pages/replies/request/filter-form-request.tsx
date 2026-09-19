import {z} from "zod";

import {Card} from "@/components/ui/card.tsx";
import {
    Check,
    ChevronDown,
    ChevronDownIcon,
    Clock,
    Filter,
    X,
    Calendar as Cld,
} from "lucide-react";
import {useContext, useEffect, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {getAllTaskTypeAPI} from "@/apis/taskTypeAPI.ts";
import type {TaskType} from "@/types/TaskType.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import type {Priority} from "@/types/Priority.ts";
import {getAllPriorityAPI} from "@/apis/priorityAPI.ts";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Label} from "@/components/ui/label.tsx";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {Calendar} from "@/components/ui/calendar.tsx";

const schema = z.object({
    priorityId: z.array(z.string()).optional(),
    taskTypeId: z.array(z.string()).optional(),
    timeApprovedStart: z.date().optional(),
    timeApprovedEnd: z.date().optional(),
    timeRequestStart: z.date().optional(),
    timeRequestEnd: z.date().optional(),
    order: z.string().optional(),
});

export type FilterReqFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    onSubmit?: (orgId: string, filterTask: FilterReqFormSchema) => void;
    onSubmitPdAndRj?: (orgId: string, taskStatus: number, filterTask: FilterReqFormSchema) => void;
    orgId?: string;
    loading?: boolean;
    type: string;
};
export default function FilterReqForm({
                                          onSubmit,
                                          onSubmitPdAndRj,
                                          orgId,
                                          type,
                                      }: ComponentProps) {
    const {
        watch,
        handleSubmit,
        getValues,
        setValue,
        control,
        formState: {errors},
    } = useForm<FilterReqFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            taskTypeId: [],
            priorityId: [],
            timeApprovedStart: undefined,
            timeApprovedEnd: undefined,
            timeRequestStart: undefined,
            timeRequestEnd: undefined,
            order: "",
        },
    });

    const taskTypeId = watch("taskTypeId");
    const priorityId = watch("priorityId");
    const timeApprovedStart = watch("timeApprovedStart");
    const timeApprovedEnd = watch("timeApprovedEnd");
    const timeRequestStart = watch("timeRequestStart");
    const timeRequestEnd = watch("timeRequestEnd");
    const order = watch("order");

    const [openTimeApStart, setOpenTimeApStart] = useState(false);
    const [openTimeApEnd, setOpenTimeApEnd] = useState(false);
    const [openTimeReqStart, setOpenTimeReqStart] = useState(false);
    const [openTimeReqEnd, setOpenTimeReqEnd] = useState(false);
    const [openDateReqPopover, setOpenDateReqPopover] = useState(false);
    const [openDateApPopover, setOpenDateApPopover] = useState(false);
    const [categories, setCategories] = useState<TaskType[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const {complex} = useContext(AuthContext);

    useEffect(() => {
        getAllTaskType(complex);
        getAllPriority();
    }, []);

    const getAllTaskType = async (complexId: string) => {
        const data = await getAllTaskTypeAPI(complexId);
        setCategories(data);
    };

    const getAllPriority = async () => {
        const data = await getAllPriorityAPI();
        setPriorities(data);
    };

    return (
        <Card className="mb-6 p-6 border-slate-200 bg-white shadow-sm">
            <form
                onSubmit={handleSubmit((data) => {
                    // Gửi ngược data + id lên cha
                    if (onSubmit) {
                        onSubmit(orgId, data);
                    }
                    if (onSubmitPdAndRj) {
                        if (type == "pd") onSubmitPdAndRj(orgId, 2, data);
                        else onSubmitPdAndRj(orgId, 3, data);
                    }
                })}
            >

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-3">
                    {/* Category Filter */}
                    <Controller
                        control={control}
                        name="taskTypeId"
                        render={({field}) => (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-slate-200 bg-white hover:bg-slate-50 py-4"
                                    >
                                        <Filter className="mr-2 h-4 w-4"/>
                                        Danh mục{" "}
                                        {(taskTypeId ?? []).length > 0 &&
                                            `(${taskTypeId?.length})`}
                                        <ChevronDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-50">
                                    {categories.map((category: TaskType) => (
                                        <DropdownMenuCheckboxItem
                                            key={category.id}
                                            checked={field.value?.includes(category.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(checked) => {
                                                field.onChange(
                                                    checked
                                                        ? [...(field.value ?? []), category.id]
                                                        : (field.value ?? []).filter(
                                                            (v) => v !== category.id
                                                        )
                                                );
                                            }}
                                        >
                                            {category.typeName.toLowerCase()}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    />

                    {/* Priority Filter */}
                    <Controller
                        control={control}
                        name="priorityId"
                        render={({field}) => (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-slate-200 bg-white hover:bg-slate-50"
                                    >
                                        <Filter className="mr-2 h-4 w-4"/>
                                        Ưu tiên{" "}
                                        {(priorityId ?? []).length > 0 &&
                                            `(${priorityId?.length})`}
                                        <ChevronDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-50">
                                    {priorities.map((priority: Priority) => (
                                        <DropdownMenuCheckboxItem
                                            key={priority.id}
                                            checked={field.value?.includes(priority.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(checked) => {
                                                field.onChange(
                                                    checked
                                                        ? [...(field.value ?? []), priority.id]
                                                        : (field.value ?? []).filter(
                                                            (v) => v !== priority.id
                                                        )
                                                );
                                            }}
                                        >
                                            <span>{priority.priorityName.toLowerCase()}</span>
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    />

                    {/*date request*/}
                    <Popover
                        open={openDateReqPopover}
                        onOpenChange={setOpenDateReqPopover}
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
                                        <Label htmlFor="timeRequestStart" className="px-1">
                                            Từ ngày
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="timeRequestStart"
                                            render={({field}) => (
                                                <Popover
                                                    open={openTimeReqStart}
                                                    onOpenChange={setOpenTimeReqStart}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            id="timeRequestStart"
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
                                                                getValues("timeRequestEnd")
                                                                    ? {
                                                                        after: new Date(
                                                                            getValues("timeRequestEnd") ?? Date()
                                                                        ),
                                                                    }
                                                                    : false
                                                            }
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setOpenTimeReqStart(false);
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
                                        <Label htmlFor="time-request-end" className="px-1">
                                            Đến ngày
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="timeRequestEnd"
                                            render={({field}) => (
                                                <Popover
                                                    open={openTimeReqEnd}
                                                    onOpenChange={setOpenTimeReqEnd}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            id="time-request-end"
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
                                                                getValues("timeRequestStart")
                                                                    ? {
                                                                        before: new Date(
                                                                            getValues("timeRequestStart") ??
                                                                            Date()
                                                                        ),
                                                                    }
                                                                    : false
                                                            }
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setOpenTimeReqEnd(false);
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </div>
                                {(timeRequestStart || timeRequestEnd) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            setValue("timeRequestStart", undefined);
                                            setValue("timeRequestEnd", undefined);
                                            // Đóng popover cha để force re-render
                                            setOpenDateReqPopover(false);
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

                    {/*date approve*/}
                    <Popover open={openDateApPopover} onOpenChange={setOpenDateApPopover}>
                        <PopoverTrigger asChild>
                            {type != "pd" ? (
                                <Button variant="outline">
                                    <Cld className="mr-1 h-4 w-4"/>
                                    {type == "rj" ? "Ngày từ chối" : "Ngày phê duyệt"}
                                    <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            ) : null}
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                        >
                            <div className="flex w-64 flex-col gap-6 p-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-1 flex-col gap-3">
                                        <Label htmlFor="timeApprovedStart" className="px-1">
                                            Từ ngày
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="timeApprovedStart"
                                            render={({field}) => (
                                                <Popover
                                                    open={openTimeApStart}
                                                    onOpenChange={setOpenTimeApStart}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            id="timeApprovedStart"
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
                                                                getValues("timeApprovedEnd")
                                                                    ? {
                                                                        after: new Date(
                                                                            getValues("timeApprovedEnd") ?? Date()
                                                                        ),
                                                                    }
                                                                    : false
                                                            }
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setOpenTimeApStart(false);
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
                                        <Label htmlFor="timeApprovedEnd" className="px-1">
                                            Đến ngày
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="timeApprovedEnd"
                                            render={({field}) => (
                                                <Popover
                                                    open={openTimeApEnd}
                                                    onOpenChange={setOpenTimeApEnd}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            id="timeApprovedEnd"
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
                                                                getValues("timeApprovedStart")
                                                                    ? {
                                                                        before: new Date(
                                                                            getValues("timeApprovedStart") ??
                                                                            Date()
                                                                        ),
                                                                    }
                                                                    : false
                                                            }
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setOpenTimeApEnd(false);
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </div>
                                {(timeApprovedStart || timeApprovedEnd) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            setValue("timeApprovedStart", undefined);
                                            setValue("timeApprovedEnd", undefined);
                                            setOpenDateApPopover(false);
                                        }}
                                        className="w-full text-slate-600 hover:text-slate-900"
                                    >
                                        <X className="mr-2 h-4 w-4"/>
                                        Xóa bộ lọc ngày phê duyệt
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Sort */}
                    <Controller
                        control={control}
                        name="order"
                        render={({field}) => (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-slate-200 bg-white hover:bg-slate-50"
                                    >
                                        <Clock className="mr-2 h-4 w-4"/>
                                        Sắp xếp
                                        {field.value && " (*)"}
                                        <ChevronDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="start" className="w-48">
                                    {["desc", "asc", ""].map((value) => (
                                        <DropdownMenuItem
                                            key={value}
                                            onSelect={() => field.onChange(value)}
                                            className="cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value === value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {value === "desc"
                                                ? "Mới nhất"
                                                : value === "asc"
                                                    ? "Cũ nhất"
                                                    : "Mặc định"}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    />

                    {/* Reset Filters */}
                    {((taskTypeId ?? []).length > 0 ||
                        (priorityId ?? []).length > 0 ||
                        timeApprovedStart ||
                        timeApprovedEnd ||
                        timeRequestStart ||
                        timeRequestEnd ||
                        order) && (
                        <Button
                            variant="ghost"
                            type="button"
                            size="sm"
                            onClick={() => {
                                setValue("taskTypeId", []);
                                setValue("priorityId", []);
                                setValue("timeApprovedStart", undefined);
                                setValue("timeApprovedEnd", undefined);
                                setValue("timeRequestStart", undefined);
                                setValue("timeRequestEnd", undefined);
                                setValue("order", "");
                            }}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                    <Button type="submit">Áp dụng</Button>
                </div>
            </form>
        </Card>
    );
}
