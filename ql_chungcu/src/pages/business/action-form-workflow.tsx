import {useContext, useEffect} from "react";
import {useForm, Controller, useFieldArray} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2, Plus, Trash2, X, ChevronsUpDown} from "lucide-react";
import {Badge} from "@/components/ui/badge.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command.tsx";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet.tsx";
import type {fillItemWf} from "@/types/Workflow.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {AuthContext} from "@/context/AuthContext.tsx";
import {POSITION} from "@/utils/mem-constant.ts";
import {LAY0UT_MODULE} from "@/utils/layout-constant.ts";

// Định nghĩa schema Zod
const schema = z.object({
    workflowName: z.string().min(1, "Tên quy trình không được để trống"),
    description: z.string().optional(),
    status: z.number().optional(),
    workflowSteps: z
        .array(
            z.object({
                orgLevel: z.number().optional(),
                stepOrder: z.number().optional(),
                description: z.string().optional(),
                status: z.number().optional(),
                position: z.array(z.string()),
                moduleCode: z.string().optional(),
            }),
        )
        .optional(),
});

export type WorkflowFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    action: string;
    formData: fillItemWf; // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
    itemsOrg: any[];
    itemsPosition: any[];
    onSubmit: (data: WorkflowFormSchema, wfId: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    loading?: boolean;
};

export default function WorkflowForm({
                                         open,
                                         setOpen,
                                         loading,
                                         action,
                                         formData,
                                         itemsOrg,
                                         itemsPosition,
                                         onSubmit,
                                     }: ComponentProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        getValues,
        formState: {errors},
    } = useForm<WorkflowFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            workflowName: formData.workflowName || "",
            description: formData.description || "",
            status: formData.status || 0,
            workflowSteps: formData?.workflowSteps?.length
                ? formData.workflowSteps.map((step) => ({
                    orgLevel: step.orgLevel || itemsOrg[0]?.value || 1,
                    stepOrder: step.stepOrder || 1,
                    description: step.description || "",
                    status: step.status || 0,
                    moduleCode: step.moduleCode || "",
                    position: step.workflowStepApprovers || [],
                }))
                : [
                    {
                        orgLevel: itemsOrg[0]?.value || 1,
                        stepOrder: 1,
                        description: "",
                        moduleCode: "",
                        status: 0,
                        position: [],
                    },
                ],
        },
    });

    const {complex} = useContext(AuthContext);

    useEffect(() => {
        reset({
            workflowName: formData?.workflowName || "",
            description: formData?.description || "",
            status: formData?.status || 0,
            workflowSteps: formData?.workflowSteps?.length
                ? formData.workflowSteps.map((step) => ({
                    orgLevel: step.orgLevel || itemsOrg[0]?.value || 1,
                    stepOrder: step.stepOrder || 1,
                    description: step.description || "",
                    moduleCode: step.moduleCode || "",
                    status: step.status || 0,
                    position: step.workflowStepApprovers || [],
                }))
                : [
                    {
                        orgLevel: itemsOrg[0]?.value || 1,
                        stepOrder: 1,
                        description: "",
                        moduleCode: "",
                        status: 0,
                        position: [],
                    },
                ],
        });
    }, [formData, reset, itemsOrg]);

    const {fields, append, remove, replace} = useFieldArray({
        control,
        name: "workflowSteps",
    });

    const onAdd = () => {
        append({
            orgLevel: itemsOrg[0]?.value || 1,
            stepOrder: fields.length + 1,
            description: "",
            status: 0,
            position: [],
        });
    };

    const onRemove = (index: number) => {
        remove(index);
        // reset stepOrder sau remove:
        const newArr = (getValues("workflowSteps") ?? []).map((s, i) => ({
            ...s,
            stepOrder: i + 1,
        }));
        replace(newArr);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="sm:max-w-[625px] flex flex-col">
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
                        const payload = {
                            ...data,
                            complex_id: complex,
                        };

                        onSubmit(payload, formData?.id);
                    })}
                >
                    <SheetHeader>
                        <SheetTitle>
                            {action === "CREATE"
                                ? "Tạo quy trình mới"
                                : "Chỉnh sửa quy trình"}
                        </SheetTitle>
                        <SheetDescription>
                            Cấu hình các cấp xét duyệt và điều kiện áp dụng.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="workflowName">Tên quy trình</Label>
                                <Input
                                    id="workflowName"
                                    {...register("workflowName", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                                {errors.workflowName && (
                                    <p className="text-sm text-red-500">
                                        {errors.workflowName.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="description">Mô tả</Label>
                                <Input
                                    id="description"
                                    {...register("description", {
                                        setValueAs: (value) => value?.trim(),
                                    })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Bước xét duyệt</Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onAdd}
                                    type="button"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Thêm bước
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-medium">Bước {index + 1}</h5>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRemove(index)}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </div>

                                    {/*<div className="grid grid-cols-2 gap-4">*/}
                                    <div>
                                        <Label className="mb-2">Bước xét duyệt</Label>
                                        <Controller
                                            control={control}
                                            name={`workflowSteps.${index}.moduleCode`}
                                            render={({field}) => (
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(value)
                                                    }
                                                    value={field.value?.toString()}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Chọn module"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(LAY0UT_MODULE).map(([key, value]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {/*<div className="grid grid-cols-2 gap-4">*/}
                                    <div>
                                        <Label className="my-2 mb-2">Cấp ban xét duyệt</Label>
                                        <Controller
                                            control={control}
                                            name={`workflowSteps.${index}.orgLevel`}
                                            render={({field}) => (
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(Number(value))
                                                    }
                                                    value={field.value?.toString()}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Chọn cấp ban"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itemsOrg.map((item) => (
                                                            <SelectItem
                                                                key={item.value}
                                                                value={item.value.toString()}
                                                            >
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label className="my-2">Vị trí</Label>
                                        <Controller
                                            control={control}
                                            name={`workflowSteps.${index}.position`}
                                            render={({field}) => {
                                                const selectedPositions = field.value || [];
                                                return (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className="w-full justify-between min-h-10 h-auto"
                                                            >
                                                                <div className="flex flex-wrap gap-1 flex-1">
                                                                    {selectedPositions.length === 0 ? (
                                                                        <span className="text-muted-foreground">
                                      Chọn vị trí...
                                    </span>
                                                                    ) : (
                                                                        selectedPositions.map((posId: string) => {
                                                                            const pos = itemsPosition.find(
                                                                                (p) => p.value === posId,
                                                                            );
                                                                            return pos ? (
                                                                                <Badge
                                                                                    key={posId}
                                                                                    variant="secondary"
                                                                                    className="mr-1"
                                                                                >
                                                                                    {pos.label}
                                                                                    <button
                                                                                        type="button"
                                                                                        className="ml-1 rounded-full outline-none hover:bg-muted"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            field.onChange(
                                                                                                selectedPositions.filter(
                                                                                                    (id: string) => id !== posId,
                                                                                                ),
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        <X className="h-3 w-3"/>
                                                                                    </button>
                                                                                </Badge>
                                                                            ) : null;
                                                                        })
                                                                    )}
                                                                </div>
                                                                <ChevronsUpDown
                                                                    className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-full p-0 z-[1000] pointer-events-auto">
                                                            <Command>
                                                                <CommandInput placeholder="Tìm kiếm vị trí..."/>
                                                                <CommandEmpty>
                                                                    Không tìm thấy vị trí.
                                                                </CommandEmpty>
                                                                <CommandGroup className="max-h-64 overflow-auto">
                                                                    {itemsPosition.map((item) => (
                                                                        <CommandItem
                                                                            key={item.value}
                                                                            onSelect={() => {
                                                                                const isSelected =
                                                                                    selectedPositions.includes(
                                                                                        item.value,
                                                                                    );
                                                                                const newValue = isSelected
                                                                                    ? selectedPositions.filter(
                                                                                        (id: string) => id !== item.value,
                                                                                    )
                                                                                    : [...selectedPositions, item.value];
                                                                                field.onChange(newValue);
                                                                            }}
                                                                        >
                                                                            <Checkbox
                                                                                checked={selectedPositions.includes(
                                                                                    item.value,
                                                                                )}
                                                                                className="mr-2"
                                                                            />
                                                                            {item.label}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                );
                                            }}
                                        />
                                    </div>
                                    {/*</div>*/}
                                    <div className="mt-4">
                                        <Label className="mb-2">Mô tả</Label>
                                        <Textarea
                                            {...register(`workflowSteps.${index}.description`, {
                                                setValueAs: (value) => value?.trim(),
                                            })}
                                            defaultValue={field.description}
                                            placeholder="Mô tả"
                                        />
                                    </div>
                                </div>
                            ))}
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
