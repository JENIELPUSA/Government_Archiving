import {
    FolderArchive,
    MessageCircleMore,
    FolderOpen,
    Home,
    SquarePen,
    FolderClock,
    PackagePlus,
    Settings,
    Logs,
    View,
    Upload,
    Users,
} from "lucide-react";

export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/dashboard",
            },
        ],
    },
    {
        title: "Document Management",
        links: [
            {
                label: "Upload Document",
                icon: Upload,
                path: "/dashboard/upload-documents",
            },
            {
                label: "Archive File",
                icon: FolderArchive,
                path: "/dashboard/search-archiving",
            },
            {
                label: "View Documents",
                icon: View,
                path: "/dashboard/view-documents",
            },
            {
                label: "Recent Documents",
                icon: FolderClock,
                path: "/dashboard/recent",
            },
        ],
    },
    {
        title: "User & System Administration ",
        links: [
            {
                label: "User Management",
                icon: Users,
                path: "/dashboard/user-management",
            },
            {
                label: "Audit Logs",
                icon: Logs,
                path: "/dashboard/logs",
            }
        ],
    },
    {
        title: "Member List",
        links: [
            {
                label: "SB Member List",
                icon: Users,
                path: "/dashboard/SBmember",
            },
        ],
    },
    {
        title: "System Settings",
        links: [
            {
                label: "Settings",
                icon: Settings,
                path: "dashboard/settings",
            }
 
        ],
    },
];
