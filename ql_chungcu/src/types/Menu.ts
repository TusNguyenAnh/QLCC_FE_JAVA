import {
    BanknoteArrowDown,
    BanknoteArrowUp, Box,
    Building,
    Building2, CircleDollarSign, FileChartColumnIncreasing,
    FileText, HandCoins,
    Home, Landmark, Lock,
    LogOut, type LucideIcon,
    Network, Send,
    Settings, Shield, UserCog,
    UserRoundCog, Users, Wallet,
    Workflow,
} from "lucide-react";

export interface MenuItem {
    id: number;
    title: string;
    url: string;
    icon: LucideIcon;
    child: MenuItem[];
    permissions?: string[]; // Required permissions (ANY logic)
    requireAll?: boolean; // If true, use ALL logic instead of ANY
}

/**
 * Cấu hình menu items cho sidebar
 * permissions: Danh sách quyền cần có (OR logic mặc định)
 * requireAll: true = Cần tất cả quyền (AND logic)
 */
export const menuItems: MenuItem[] = [
    {
        id: 1,
        title: "Trang chủ",
        url: "/page/dashboard",
        icon: Home,
        child: [],
        // Không cần permissions = ai cũng vào được
    },
    {
        id: 2,
        title: "Quản lý cơ cấu tổ chức",
        url: "/page/org",
        icon: Network,
        child: [],
        permissions: ["view:organization"],
    },
    {
        id: 3,
        title: "Quản lý quy trình",
        url: "/page/bsn",
        icon: Workflow,
        child: [],
        permissions: ["view:workflow"],
    },
    {
        id: 8,
        title: "Quản lý tòa nhà",
        url: "/page/bd",
        icon: Building2,
        child: [],
        permissions: ["view:building"],
    },
    {
        id: 4,
        title: "Cư dân căn hộ",
        url: "#",
        icon: Building,
        child: [
            {
                id: 5,
                title: "Quản lý cư dân",
                url: "/page/apres/res",
                icon: UserRoundCog,
                child: [],
                permissions: ["view:resident"],
            },
            {
                id: 6,
                title: "Quản lý căn hộ",
                url: "/page/apres/apt",
                icon: Home,
                child: [],
                permissions: ["view:apartment"],
            },
        ],
        // Hiển thị menu cha nếu có ít nhất 1 quyền con
        permissions: ["view:apartment", "view:resident"],
    },
    {
        id: 10,
        title: "Xử lý yêu cầu",
        url: "/page/reply",
        icon: FileText,
        child: [],
        permissions: ["review:task"],
    },
    {
        id: 22,
        title: "Gửi yêu cầu",
        url: "/page/send_request",
        icon: Send,
        child: [],
        permissions: ["view:complex"],
    },
    {
        id: 12,
        title: "Quản lý tài chính",
        url: "#",
        icon: CircleDollarSign,
        child: [
            {
                id: 21,
                title: "Mô hình tài chính",
                url: "/page/finance/model",
                icon: Box,
                child: [],
                permissions: ['view:expense'],
            },
            {
                id: 13,
                title: "Quản lý thu",
                url: "/page/finance/revenue",
                icon: BanknoteArrowUp,
                child: [],
                permissions: ['view:revenue'],
            },
            {
                id: 14,
                title: "Quản lý chi",
                url: "/page/finance/expense",
                icon: BanknoteArrowDown,
                child: [],
                permissions: ['view:expense'],
            },
            {
                id: 23,
                title: "Quản lý tài khoản tiền gửi",
                url: "/page/finance/deposit",
                icon: Wallet,
                child: [],
                permissions: ['view:expense'],
            }
        ],
        permissions: ['view:revenue', 'view:expense'],
    },
    {
        id: 15,
        title: "Báo cáo tài chính",
        url: "#",
        icon: FileChartColumnIncreasing,
        child: [
            {
                id: 16,
                title: "Sổ quỹ",
                url: "/page/report/cash",
                icon: HandCoins,
                child: [],
                permissions: ['view:revenue', 'view:expense'],
            }
        ],
        permissions: ['view:revenue', 'view:expense'],
    },
    {
        id: 11,
        title: "Quản lý truy cập",
        url: "#",
        icon: UserCog,
        child: [
            {
                id: 18,
                title: "Quản lý vai trò",
                url: "/page/authori/role",
                icon: Shield,
                child: [],
                permissions: ['view:role'],
                requireAll: false,
            },
            {
                id: 19,
                title: "Quản lý quyền hạn",
                url: "/page/authori/permission",
                icon: Lock,
                child: [],
                permissions: ['view:permission'],
                requireAll: false,
            },
            {
                id: 20,
                title: "Quản lý người dùng",
                url: "/page/authori/user",
                icon: Users,
                child: [],
                permissions: ['view:user'],
                requireAll: false,
            }
        ],
        permissions: ["view:user", "view:role", "view:permission"],
        requireAll: true,
    },
    // {
    //     id: 7,
    //     title: "Cài đặt",
    //     url: "#",
    //     icon: Settings,
    //     child: [],
    //     permissions: ["view:organization"],
    // },
    {
        id: 9,
        title: "Đăng xuất",
        url: "#",
        icon: LogOut,
        child: [],
        // Không cần permissions = ai cũng thấy
    },
];
