import { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox.tsx";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";

import type { fillItemOrg } from "@/types/Organization.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import type { bdItemCheckbox } from "@/types/Building.ts";
import { AuthContext } from "@/context/AuthContext.tsx";
import { getBdIdByOrgIdAPI } from "@/apis/orgAPI.ts";

// Định nghĩa schema Zod
const schema = z.object({
  orgCode: z.string().min(1, "Mã đơn vị không được để trống"),
  orgName: z.string().min(1, "Tên đơn vị không được để trống"),
  description: z.string().optional(),
  parentOrgId: z.string().optional(),
  buildingIds: z.array(z.string()).optional(),
});

export type OrgFormSchema = z.infer<typeof schema>;

type ComponentProps = {
  action: string;
  formData: fillItemOrg; // bạn có thể định nghĩa rõ ràng kiểu dữ liệu nếu muốn
  itemsOrg: any[];
  itemsAllBd: any[];
  onSubmit: (data: OrgFormSchema, orgId: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  loading?: boolean;
};

export default function OrgForm({
  open,
  setOpen,
  loading,
  action,
  formData,
  itemsOrg,
  itemsAllBd,
  onSubmit,
}: ComponentProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OrgFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      orgCode: formData?.orgCode || "",
      orgName: formData?.orgName || "",
      description: formData?.description || "",
      parentOrgId: formData?.parentOrgId || "",
      buildingIds: [] as string[],
    },
  });

  const [itemsBd, setItemsBd] = useState([]);
  const { complex } = useContext(AuthContext);

  useEffect(() => {
    if (formData) {
      reset({
        orgCode: formData.orgCode || "",
        orgName: formData.orgName || "",
        description: formData.description || "",
        parentOrgId: formData.parentOrgId || "",
        buildingIds: formData.buildingIds || [],
      });

      // Chỉ gọi API khi parentOrgId có giá trị
      if (formData.parentOrgId) {
        getBdIdByOrgId(
          complex,
          formData.parentOrgId,
          itemsAllBd,
          formData.buildingIds
        );
      } else {
        // Reset danh sách tòa nhà khi không có parentOrgId (trường hợp CREATE)
        setItemsBd([]);
      }
    }
  }, [formData, reset]);

  // Reset form và danh sách tòa nhà khi đóng popup
  useEffect(() => {
    if (!open) {
      reset({
        orgCode: "",
        orgName: "",
        description: "",
        parentOrgId: "",
        buildingIds: [],
      });
      setItemsBd([]);
    }
  }, [open, reset]);

  const getBdIdByOrgId = async (
    complex: string,
    parentId: string,
    allBd: any,
    buildingManaged: any
  ) => {
    try {
      const data = await getBdIdByOrgIdAPI(parentId);
      // neu tao moi thi building la cac toa nha chua dc quan ly con sua thi them cac toa nha da quan ly cua org hien tai
      const building = data.concat(buildingManaged);
      const buildingNotManaged = allBd.filter((item) =>
        building.includes(item.id)
      );
      setItemsBd(buildingNotManaged);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-[425px] flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-1" />
            Loading...
          </div>
        )}

        <form
          className="flex flex-col flex-1 relative"
          onSubmit={handleSubmit((data) => {
            // Gửi ngược data + id lên cha
            onSubmit(data, formData?.id);
          })}
        >
          <SheetHeader>
            <SheetTitle>
              {action === "CREATE"
                ? "Thêm mới đơn vị"
                : "Cập nhật thông tin đơn vị"}
            </SheetTitle>
            <SheetDescription>
              {action === "CREATE"
                ? "Nhập thông tin đơn vị mới. Nhấn nút lưu để hoàn thành việc thêm mới."
                : "Cập nhật thông tin đơn vị. Nhấn nút lưu để hoàn thành việc cập nhật"}
            </SheetDescription>
          </SheetHeader>

          <div className="grid auto-rows-min px-4 h-[70vh] overflow-y-auto">
            <div className="grid gap-4">
              {/* Mã đơn vị */}
              <div className="grid gap-3">
                <Label htmlFor="orgCode">Mã đơn vị</Label>
                <Input
                  id="orgCode"
                  {...register("orgCode", {
                    setValueAs: (value) => value?.trim(),
                  })}
                />
                {errors.orgCode && (
                  <p className="text-sm text-red-500">
                    {errors.orgCode.message}
                  </p>
                )}
              </div>

              {/* Tên đơn vị */}
              <div className="grid gap-3">
                <Label htmlFor="orgName">Tên đơn vị</Label>
                <Input
                  id="orgName"
                  {...register("orgName", {
                    setValueAs: (value) => value?.trim(),
                  })}
                />
                {errors.orgName && (
                  <p className="text-sm text-red-500">
                    {errors.orgName.message}
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div className="grid gap-3">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  {...register("description", {
                    setValueAs: (value) => value?.trim(),
                  })}
                />
              </div>

              {/* Combobox - Đơn vị cha */}
              <div className="grid gap-3">
                <Label htmlFor="parentOrgId">Thuộc</Label>
                <Controller
                  control={control}
                  name="parentOrgId"
                  render={({ field }) => (
                    <Combobox
                      items={itemsOrg}
                      onChange={(value) => {
                        console.log(value);
                        field.onChange(value);
                        //  Chỉ gọi API khi value có giá trị
                        if (value) {
                          getBdIdByOrgId(
                            complex,
                            value,
                            itemsAllBd,
                            formData.buildingIds
                          );
                        } else {
                          setItemsBd([]); // Reset danh sách tòa nhà khi không chọn đơn vị cha
                        }
                      }}
                      itemUpdate={
                        action === "UPDATE" ? formData.parentOrgId : ""
                      }
                    />
                  )}
                />
              </div>

              <div className="grid gap-4">
                <Label>Quản trị tòa</Label>
                <div className="h-[210px] overflow-y-auto">
                  {itemsBd.map((itemBd: bdItemCheckbox) => (
                    <Controller
                      key={itemBd.id}
                      control={control}
                      name="buildingIds"
                      render={({ field }) => {
                        const checked = !!field.value?.includes(itemBd.id);
                        return (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={itemBd.id}
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                // clone mảng hiện tại
                                const current = field.value || [];
                                let updated: string[];

                                if (isChecked) {
                                  updated = [...current, itemBd.id];
                                } else {
                                  updated = current.filter(
                                    (v) => v !== itemBd.id
                                  );
                                }

                                field.onChange(updated);
                              }}
                            />
                            <Label
                              htmlFor={itemBd.id}
                              className="flex-1 cursor-pointer py-2"
                            >
                              {itemBd.buildingName}
                            </Label>
                          </div>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-4 absolute bottom-1 w-full">
            <Button type="submit">Lưu thay đổi</Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" onClick={() => {}}>
                Hủy
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
