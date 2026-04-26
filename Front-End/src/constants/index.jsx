import {
    FolderArchive,
    MessageCircleMore,
    FolderOpen,
    Home,
    SquarePen,
    FolderClock,
    SquareMenu,
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
        title: "Member List",
        links: [
            {
                label: "SP Member List",
                icon: Users,
                path: "/dashboard/SPmember",
            },
        ],
    },
    {
        title: "Document Management",
        links: [
            {
                label: "Archive File",
                icon: FolderArchive,
                path: "/dashboard/search-archiving",
            },
            {
                label: "Files",
                icon: FolderClock,
                path: "/dashboard/oldFiles",
            },
            //{
                //label: "View Documents",
                //icon: View,
               // path: "/dashboard/view-documents",
            //},
           // {
                //label: "Upload Document",
               // icon: Upload,
                //path: "/dashboard/upload-documents",
            //},
            {
                label: "Category",
                icon: SquareMenu,
                path: "/dashboard/Category",
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
            },
        ],
    },

    {
        title: "System Settings",
        links: [
            {
                label: "Settings",
                icon: Settings,
                path: "settings",
            },
        ],
    },
];
