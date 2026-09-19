"use client"

import * as React from "react"

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Link, useLocation} from "react-router-dom";
import {Fragment} from "react";


interface BreadcrumbItem {
    label: string;
    href?: string;
    isActive: boolean;
}

export default function Header() {
    const [open, setOpen] = React.useState(false)
    const location = useLocation();
    const pathname = location.pathname.startsWith('/page') ? location.pathname.slice(5) : location.pathname;
    ;
    const ITEMS_TO_DISPLAY = 3;
    const pathToLabelMap: { [key: string]: string } = {
        org: 'Quản lý cơ cấu tổ chức',
        bd: 'Quản lý tòa nhà',
        apres: 'Cư dân căn hộ',
        apt: 'Quản lý căn hộ',
        res: 'Quản lý cư dân',
        bsn: 'Quản lý quy trình',
        reply: 'Xử lý yêu cầu',
        authori: 'Quản lý truy cập',
        role: 'Quản lý vai trò',
        permission: 'Quản lý quyền hạn',
        user: 'Quản lý người dùng',
        finance: 'Quản lý tài chính',
        revenue: 'Quản lý thu',
        expense: 'Quản lý chi',
        deposit: 'Quản lý tài khoản tiền gửi',
        report: 'Báo cáo',
        settings: 'Cài đặt',
        cash: 'Sổ quỹ tiền mặt',
        model: 'Mô hình tài chính',
        send_request: 'Gửi yêu cầu, phản ánh',
    };

    // Hàm tạo mảng breadcrumb từ URL
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        // Tách URL thành các đoạn
        const segments = pathname.split('/').filter(segment => segment);

        // Thêm mục Home
        const breadcrumbs: BreadcrumbItem[] = [
            {label: 'Trang chủ', href: '/', isActive: pathname === '/'},
        ];

        // Biến để xây dựng đường dẫn tích lũy
        let path = '';

        // Duyệt qua các đoạn để tạo breadcrumb
        segments.forEach((segment, index) => {
            path += `/${segment}`;
            const isLast = index === segments.length - 1;
            breadcrumbs.push({
                label: pathToLabelMap[segment] || segment
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '), // Format: "iphone-13" -> "Iphone 13"
                href: isLast ? undefined : path,
                isActive: isLast,
            });
        });

        // console.log(breadcrumbs);

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.length > ITEMS_TO_DISPLAY - 1 && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={breadcrumbs[0].href ?? "/"}>{breadcrumbs[0].label}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                    </>
                )}
                {breadcrumbs.length > ITEMS_TO_DISPLAY ? (
                    <>
                        <BreadcrumbItem>
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                                <DropdownMenuTrigger
                                    className="flex items-center gap-1"
                                    aria-label="Toggle menu"
                                >
                                    <BreadcrumbEllipsis className="size-4"/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {breadcrumbs.slice(1, -2).map((item, index) => (
                                        <DropdownMenuItem key={index}>
                                            <Link to={item.href ? item.href : "#"}>
                                                {item.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                    </>
                ) : null}
                {breadcrumbs.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
                    <Fragment key={index}>

                        <BreadcrumbItem>
                            {item.href ? (
                                <>
                                    <BreadcrumbLink
                                        asChild
                                        className="max-w-20 truncate md:max-w-none"
                                    >
                                        <Link to={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                </>
                            ) : (
                                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                                    {item.label}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < (ITEMS_TO_DISPLAY - 2) && <BreadcrumbSeparator/>}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}



