import {z} from "zod";
import {useContext, useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {AuthContext} from "@/context/AuthContext.tsx";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {getAllBdAPI} from "@/apis/bdAPI.ts";
import {findByIdAPI} from "@/apis/orgAPI.ts";
import type {bdItemCheckbox} from "@/types/Building.ts";
import {Combobox} from "@/components/ui/combobox.tsx";
import {FilterX} from "lucide-react";

const schema = z.object({
    buildingId: z.string().optional(),
    floor: z.string().optional(),
    aptNumber: z.string().optional(),
});

export type FilterResFormSchema = z.infer<typeof schema>;

type ComponentProps = {
    onSubmit?: (filterRes: FilterResFormSchema) => void;
    loading?: boolean;
};
export default function FilterResForm({onSubmit}: ComponentProps) {
    const {
        register,
        watch,
        handleSubmit,
        getValues,
        setValue,
        control,
        formState: {errors},
    } = useForm<FilterResFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            buildingId: "",
            floor: "0",
            aptNumber: "",
        },
    });

    const [buildings, setBuildings] = useState<
        { value: string; label: string }[]
    >([]);
    const [floors, setFloors] = useState<{ value: string; label: string }[]>([]);
    const buildingId = watch("buildingId");
    const floor = watch("floor");
    const aptNumber = watch("aptNumber");

    const {complex, orgManage} = useContext(AuthContext);

    useEffect(() => {
        getAllBuilding();
    }, []);


    const getAllBuilding = async () => {
        try {
            let data = await getAllBdAPI();

            if (orgManage) {
                // Lọc toà nhà theo orgManage
                const bdByOrg = await findByIdAPI(orgManage);
                data = data.filter((item) => bdByOrg.building.includes(item.id));
            }

            const items = data.map(function (item: bdItemCheckbox) {
                return {
                    value: item.id,
                    label: item.buildingName,
                };
            });
            setBuildings(items);
        } catch (err) {
            console.log(err);
        }
    };

    const hasFilters = buildingId || floor || aptNumber;

    return (
        <form
            onSubmit={handleSubmit((data) => {
                // Gửi ngược data + id lên cha
                if (onSubmit) {
                    onSubmit(data);
                }
            })}
        >
            {/* Filter Controls */}
            <div className="flex flex-wrap items-end gap-3">
                {/* Building Filter */}
                <div className="flex-1 min-w-[200px]">
                    <Label
                        htmlFor="buildingId"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                        Tòa nhà
                    </Label>
                    <Controller
                        control={control}
                        name="buildingId"
                        render={({field}) => (
                            <Combobox
                                items={buildings}
                                onChange={(value) => field.onChange(value)}
                                itemUpdate={field.value || ""}
                            />
                        )}
                    />
                </div>

                {/* Floor Filter */}
                <div className="flex-1 min-w-[180px]">
                    <Label
                        htmlFor="floor"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                        Tầng
                    </Label>
                    <Input id="floor" {...register("floor", {
                        setValueAs: (v) => (v == 0 ? "" : v)
                    })}
                           type="number"
                           min="0" max="100"
                           step="1"/>
                </div>

                {/* Apartment Number Filter */}
                <div className="flex-1 min-w-[180px]">
                    <Label
                        htmlFor="aptNumber"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                        Số căn hộ
                    </Label>
                    <Input id="aptNumber" {...register("aptNumber", {
                        setValueAs: (v) => (v == 0 ? "" : v)
                    })}
                    />
                </div>

                {/* Action Buttons */}
                {hasFilters && (
                    <Button
                        variant="outline"
                        type="button"
                        size="default"
                        onClick={() => {
                            setValue("buildingId", "");
                            setValue("aptNumber", "");
                            setValue("floor", "0");
                        }}
                        className="gap-2"
                    >
                        <FilterX className="h-4 w-4"/>
                        Xóa
                    </Button>
                )}
                <Button type="submit" size="default" className="gap-2">
                    Áp dụng
                </Button>
            </div>
        </form>
    );
}
