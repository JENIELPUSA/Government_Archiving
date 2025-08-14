import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import UploadDocuments from "./component/AdminDashboard/Document/Upload/UploadForm";
import DocumentsSection from "./component/AdminDashboard/Document/DocumentSection";
import PrivateRoute from "./component/PrivateRoute/PrivateRoute";
import PublicRoute from "./component/PublicRoute/PublicRoute";
import Login from "./component/Login/Login";
import PdfViewer from "./component/PdfViewer/PdfViewer";
import OldDocument from "./component/FolderComponents/FolderUI";
import ArchiveLayout from "./component/AdminDashboard/Archive/ArchiveLayout";
import DocumentLayout from "./component/AdminDashboard/Document/DocumentsSidebar/DocumentsLayout";
import PublicAccessLayout from "./component/PublicView/Publicview";
import ExpandPDFView from "./component/PublicView/ExpandPDFView";
import CommentLayout from "./component/Comments/CommentLayout";
import LogsAndAudit from "./component/LogsAudit/LogsAndAudit";
import ResetPassword from "./component/Login/ResetPassword";
import SettingsPage from "./component/Setting/SettingLayout";
import SBmember from "./component/SBmember/SBmember";
import UnderMaintenance from "./component/PublicView/AboutUs";
import CategoryTable from "./component/AdminDashboard/Category/ManageCategoryTable";
import UserManagement from "./component/UserManagement/UserManagement";

function App() {
    const router = createBrowserRouter([
        {
            element: <PublicRoute />,
            children: [
                { path: "/", element: <Login /> },
                { path: "/login", element: <Login /> },
                { path: "/public-access", element: <PublicAccessLayout /> },
                { path: "/reset-password/:token", element: <ResetPassword /> },
                { path: "/expand-PDF", element: <ExpandPDFView /> },
            ],
        },

        {
            path: "/dashboard",
            element: <PrivateRoute />,
            children: [
                {
                    path: "",
                    element: <Layout />,
                    children: [
                        {
                            index: true,
                            element: <DashboardPage />,
                        },
                        {
                            path: "/dashboard/search-archiving",
                            element: <ArchiveLayout />,
                        },
                        {
                            path: "upload-documents",
                            element: <UploadDocuments />,
                        },
                        {
                            path: "view-documents",
                            element: <DocumentLayout />,
                        },
                        {
                            path: "/dashboard/OldFiles",
                            element: <OldDocument />,
                        },
                        {
                            path: "/dashboard/user-management",
                            element: <UserManagement />,
                        },
                        {
                            path: "/dashboard/logs",
                            element: <LogsAndAudit />,
                        },                   {
                            path: "/dashboard/Category",
                            element: <CategoryTable />,
                        },
                        {
                            path: "pdf-viewer/:fileId",
                            element: <PdfViewer />,
                        },
                        {
                            path: "/dashboard/SBmember",
                            element: <SBmember />,
                        },
                        {
                            path: "/dashboard/task-managemnet",
                            element: <UnderMaintenance />,
                        },
                        {
                            path: "dashboard/settings",
                            element: <SettingsPage />,
                        },
                        {
                            path: "/dashboard/comments",
                            element: <CommentLayout />,
                        },
                    ],
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
