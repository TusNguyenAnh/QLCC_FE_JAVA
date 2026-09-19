"use client";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import {ChevronRight} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {useContext, useEffect, useMemo, useState} from "react";
import {logoutUser} from "@/apis/authAPI.ts";
import {handleAxiosStatusCode} from "@/utils/request.ts";
import {removeToken} from "@/utils/auth.ts";
import {menuItems} from "@/types/Menu.ts";
import type {MenuItem} from "@/types/Menu.ts";
import {AuthContext} from "@/context/AuthContext.tsx";
import {findComplexByIdAPI} from "@/apis/complexAPI.ts";
import type {Complex} from "@/types/Complex.ts";

export default function SidebarCus() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [complexInfo, setComplexInfo] = useState<Complex>();
    const {clearAuth, hasAnyPermission, hasAllPermissions, complex} = useContext(AuthContext);

    useEffect(() => {
        getComplex(complex);
    }, [])

    const getComplex = async (complexId: string) => {
        try {
            if (complexId) {
                const data = await findComplexByIdAPI(complexId);
                setComplexInfo(data);
            }
        } catch (err) {
            handleAxiosStatusCode(err);
        }
    }

    // Filter menu items based on permissions
    const checkItemPermission = (item: MenuItem): boolean => {
        if (!item.permissions || item.permissions.length === 0) return true;

        return item.requireAll
            ? hasAllPermissions(item.permissions)
            : hasAnyPermission(item.permissions);
    };


    const handleLogout = async () => {
        try {
            await logoutUser();
            removeToken();
            clearAuth();
            navigate("/login", {replace: true});
        } catch (err) {
            handleAxiosStatusCode(err);
        }
    };

    // Filter menu với child items
    const visibleItems = useMemo(() => {
        return menuItems
            .map((item) => ({
                ...item,
                child: item.child.filter(checkItemPermission),
            }))
            .filter((item) => {
                // Hiển thị nếu: có quyền HOẶC có ít nhất 1 child visible
                return checkItemPermission(item) || item.child.length > 0;
            });
    }, [hasAnyPermission, hasAllPermissions]); // Re-calculate khi permissions thay đổi vi 2 ham này phụ thuộc vào chúng o trong AuthContext

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarContent>
                    <SidebarGroup>
                        <div className="flex items-center justify-between">
                            <SidebarGroupLabel hidden={open}>MBS-{complexInfo?.complexName}</SidebarGroupLabel>
                            <SidebarTrigger
                                className="p-4"
                                onClick={() => setOpen((prev) => !prev)}
                            ></SidebarTrigger>
                        </div>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleItems.map((item) => (
                                    <Collapsible className="group/collapsible grp" key={item.id}>
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                {item.title === "Đăng xuất" ? (
                                                    <SidebarMenuButton
                                                        className="flex justify-between cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleLogout();
                                                        }}
                                                    >
                                                        <div className="flex items-center">
                                                            <item.icon className="size-4 mr-1.5"/>
                                                            <span
                                                                className={
                                                                    open ? "hidden" : "fadeIn block opacity-1"
                                                                }
                                                            >
                                {item.title}
                              </span>
                                                        </div>
                                                    </SidebarMenuButton>
                                                ) : (
                                                    <Link to={item.url}>
                                                        <SidebarMenuButton className="flex justify-between h-full">
                                                            <div className={"flex items-center"}>
                                                                <item.icon className="size-4 mr-1.5"/>
                                                                <span
                                                                    className={
                                                                        open ? "hidden" : "fadeIn block opacity-1"
                                                                    }
                                                                >
                                  {item.title}
                                </span>
                                                            </div>

                                                            {item.child.length > 0 && (
                                                                <ChevronRight className="chevron-rotate"/>
                                                            )}
                                                        </SidebarMenuButton>
                                                    </Link>
                                                )}
                                            </CollapsibleTrigger>
                                            {item.child.length > 0 && (
                                                <CollapsibleContent className="CollapsibleContent">
                                                    <SidebarMenuSub>
                                                        {item.child.map((itemChild) => (
                                                            <SidebarMenuSubItem
                                                                key={itemChild.id}
                                                            >
                                                                <Link to={itemChild.url}>
                                                                    <SidebarMenuButton
                                                                        className="flex justify-between h-full">
                                                                        <div className="flex items-center">
                                                                            <itemChild.icon className="size-4 mr-1.5"/>
                                                                            <div
                                                                                className={
                                                                                    open
                                                                                        ? "hidden"
                                                                                        : "fadeIn block opacity-1"
                                                                                }
                                                                            >
                                                                                {itemChild.title}
                                                                            </div>
                                                                        </div>
                                                                    </SidebarMenuButton>
                                                                </Link>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            )}
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
