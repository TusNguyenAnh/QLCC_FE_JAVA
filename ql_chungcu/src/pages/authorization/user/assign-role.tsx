import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";

// Định nghĩa schema Zod
const schema = z.object({
  roleId: z.string(),
  userId: z.string(),
  orgId: z.string(),
});

export type AssignRoleFormSchema = z.infer<typeof schema>;

type ComponentProps = {
  user_id: string;
  org_id: string;
  itemsRole: any[];
  roleOfUser: string;
  onSubmit: (data: AssignRoleFormSchema) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  loading?: boolean;
};

export default function AssignRoleForm({
  open,
  setOpen,
  loading,
  onSubmit,
  itemsRole,
  roleOfUser,
  user_id,
  org_id,
}: ComponentProps) {
  const { handleSubmit, control, reset } = useForm<AssignRoleFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleId: roleOfUser,
      userId: user_id,
      orgId: org_id,
    },
  });

  useEffect(() => {
    reset({
      roleId: roleOfUser || "",
      userId: user_id || "",
      orgId: org_id || "",
    });
  }, [roleOfUser, user_id, reset, org_id]);

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
            onSubmit(data);
          })}
        >
          <SheetHeader>
            <SheetTitle>Cập nhật vai trò cho người dùng</SheetTitle>

            <SheetDescription>
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vai trò
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="grid auto-rows-min px-4 h-[75vh] overflow-y-auto">
            <div className="space-y-4">
              {/*{itemsRole.map((itemRole: RoleItem) => (*/}
              {/*    <div key={itemRole.id} className="space-y-2">*/}
              {/*        <div className="grid gap-2">*/}
              {/*            <Controller*/}
              {/*                key={itemRole.id}*/}
              {/*                control={control}*/}
              {/*                name="roleId"*/}
              {/*                render={({field}) => {*/}
              {/*                    const checked = !!field.value?.includes(*/}
              {/*                        itemRole.id*/}
              {/*                    )*/}

              {/*                    return (*/}
              {/*                        <Label*/}
              {/*                            htmlFor={itemRole.id}*/}
              {/*                            className="flex items-center space-x-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">*/}
              {/*                            <Checkbox*/}
              {/*                                id={itemRole.id}*/}
              {/*                                checked={checked}*/}
              {/*                                onCheckedChange={(isChecked) => {*/}
              {/*                                    // clone mảng hiện tại*/}
              {/*                                    // const current = field.value || []*/}
              {/*                                    // let updated: string[]*/}
              {/*                                    //*/}
              {/*                                    // if (isChecked) {*/}
              {/*                                    //     updated = [...current, itemRole.id]*/}
              {/*                                    // } else {*/}
              {/*                                    //     updated = current.filter((v) => v !== itemRole.id)*/}
              {/*                                    // }*/}

              {/*                                    field.onChange(itemRole.id)*/}
              {/*                                }}*/}
              {/*                            />*/}
              {/*                            <span*/}
              {/*                                className="flex-1 cursor-pointer">{itemRole.role_name}</span>*/}
              {/*                        </Label>*/}
              {/*                    )*/}
              {/*                }}*/}
              {/*            />*/}
              {/*        </div>*/}
              {/*    </div>*/}
              {/*))}*/}

              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="space-y-2"
                  >
                    {itemsRole.map((itemRole) => (
                      <Label
                        key={itemRole.id}
                        htmlFor={itemRole.id}
                        className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer"
                      >
                        <RadioGroupItem value={itemRole.id} id={itemRole.id} />
                        <span className="flex-1">{itemRole.roleName}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              />
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
