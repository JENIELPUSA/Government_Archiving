import { forwardRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navbarLinks } from "@/constants";
import { LogOut } from "lucide-react";
import logoLight from "@/assets/logo-login.png";
import logoDark from "@/assets/logo-login.png";
import { cn } from "@/utils/cn";
import { useAuth } from "../contexts/AuthContext";
import PropTypes from "prop-types";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { logout, role } = useAuth();
    const navigate = useNavigate();
    const rolePermissions = {
        officer: ["/dashboard"],
        admin: [],
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    if (!role) return null;

    const filteredNavbarLinks = navbarLinks
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => {
                if (!rolePermissions[role]) return false;
                if (rolePermissions[role].length === 0) return true;
                return rolePermissions[role].includes(link.path);
            }),
        }))
        .filter((group) => group.links.length > 0); // remove empty groups

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[50] mb-8 mt-4 flex h-full w-[240px] flex-col overflow-x-hidden",
                "rounded-r-[2rem] border-r bg-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] backdrop-blur-md",
                "[transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms,_background-color_150ms,_border_150ms]",
                "dark:border-gray-700 dark:bg-slate-800/50 dark:backdrop-blur-md",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
                "flex flex-col", 
            )}
        >
            <div className="flex gap-x-3 p-4">
                <img
                    src={logoLight}
                    alt="Logo"
                    className="h-10 w-10 dark:hidden"
                />
                <img
                    src={logoDark}
                    alt="Logo"
                    className="hidden h-10 w-10 dark:block"
                />
                {!collapsed && <p className="text-lg font-semibold text-slate-900 dark:text-white">Government Archiving System</p>}
            </div>

            <div className="flex w-full flex-grow flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {" "}
                {/* Added flex-grow */}
                {filteredNavbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        {!collapsed && <p className="sidebar-group-title mb-1 text-gray-600 dark:text-gray-300">{navbarLink.title}</p>}
                        {navbarLink.links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                end // Add this for exact matching
                                className={({ isActive }) =>
                                    cn(
                                        "sidebar-item group flex items-center gap-x-3 rounded-xl px-3 py-2 transition-colors",
                                        "hover:shadow-md",
                                        collapsed && "justify-center md:w-[45px]",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md dark:bg-blue-700"
                                            : "bg-white/30 text-gray-800 backdrop-blur-md hover:bg-blue-300 dark:bg-slate-800/40 dark:text-white dark:hover:bg-slate-700",
                                    )
                                }
                            >
                                {(
                                    { isActive }, // Wrap content in function to get isActive
                                ) => (
                                    <>
                                        <link.icon
                                            size={22}
                                            className={cn("flex-shrink-0", isActive ? "text-white" : "text-blue-500 dark:text-blue-400")}
                                        />
                                        {!collapsed && (
                                            <span
                                                className={cn(
                                                    "whitespace-nowrap text-sm font-medium",
                                                    isActive ? "text-white" : "text-gray-800 dark:text-white",
                                                )}
                                            >
                                                {link.label}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                ))}
            </div>

            <div className="mt-auto border-t border-blue-200 p-4 dark:border-blue-800">
                {" "}
                {/* Added mt-auto */}
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-lg py-2",
                        "text-sm font-medium transition-all duration-200",
                        "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/30",
                        collapsed ? "md:w-[45px] md:justify-center md:px-0 md:py-3" : "px-3",
                        "mx-1",
                    )}
                >
                    <LogOut
                        size={22}
                        className={cn("flex-shrink-0", collapsed ? "mx-auto" : "")}
                    />
                    {!collapsed && <p className="whitespace-nowrap">Logout</p>}
                </button>
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
