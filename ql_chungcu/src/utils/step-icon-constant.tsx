import {
    ClipboardCheck,
    FileText,
    FileSignature,
    PackageCheck,
    Wrench,
    Receipt,
    FileCheck2,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

interface ModuleIconConfig {
    icon: LucideIcon;
    className: string;
}

const MODULE_ICONS: Record<string, ModuleIconConfig> = {
    INSPECTION_RECORD: {
        icon: ClipboardCheck,
        className: "h-5 w-5 text-blue-600",
    },

    PROPOSAL: {
        icon: FileText,
        className: "h-5 w-5 text-amber-600",
    },

    CONTRACT: {
        icon: FileSignature,
        className: "h-5 w-5 text-purple-600",
    },

    INCOMING_ACCEPTANTCE_RECORD: {
        icon: PackageCheck,
        className: "h-5 w-5 text-emerald-600",
    },

    INSTALL_ACCEPTANTCE_RECORD: {
        icon: Wrench,
        className: "h-5 w-5 text-cyan-600",
    },

    PAYMENT_DOCUMENTATION: {
        icon: Receipt,
        className: "h-5 w-5 text-teal-600",
    },
};

export const getModuleIcon = (moduleCode: string) => {
    const config = MODULE_ICONS[moduleCode];

    if (!config) {
        return (
            <FileCheck2 className="h-5 w-5 text-primary" />
        );
    }

    const Icon = config.icon;

    return <Icon className={config.className} />;
};