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
import ExpandPDFView from "./component/PublicView/PDFview";
import CommentLayout from "./component/Comments/CommentLayout";
import LogsAndAudit from "./component/LogsAudit/LogsAndAudit";
import ResetPassword from "./component/Login/ResetPassword";
import SettingsPage from "./component/Setting/SettingLayout";
import SBmember from "./component/SBmember/SBmember";
import UnderMaintenance from "./component/PublicView/AboutUs";
import CategoryTable from "./component/AdminDashboard/Category/ManageCategoryTable";
import UserManagement from "./component/UserManagement/UserManagement";
import LatestNews from "./component/PublicView/NewandInformation/NewsContent";
import NotFoundPage from "./component/404/404Component.jsx"; //import your 404 component

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
                { path: "/expand-LatestNews", element: <LatestNews /> },
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
                        { index: true, element: <DashboardPage /> },
                        { path: "search-archiving", element: <ArchiveLayout /> },
                        { path: "upload-documents", element: <UploadDocuments /> },
                        { path: "view-documents", element: <DocumentLayout /> },
                        { path: "OldFiles", element: <OldDocument /> },
                        { path: "user-management", element: <UserManagement /> },
                        { path: "logs", element: <LogsAndAudit /> },
                        { path: "Category", element: <CategoryTable /> },
                        { path: "pdf-viewer/:fileId", element: <PdfViewer /> },
                        { path: "SPmember", element: <SBmember /> },
                        { path: "task-managemnet", element: <UnderMaintenance /> },
                        { path: "settings", element: <SettingsPage /> },
                        { path: "comments", element: <CommentLayout /> },
                    ],
                },
            ],
        },
        {
            path: "*",
            element: <NotFoundPage />,
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
