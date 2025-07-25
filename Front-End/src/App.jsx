import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import UploadDocuments from "./component/AdminDashboard/Document/UploadForm";
import DocumentsSection from "./component/AdminDashboard/Document/DocumentSection";
import PrivateRoute from "./component/PrivateRoute/PrivateRoute";
import PublicRoute from "./component/PublicRoute/PublicRoute";
import Login from "./component/Login/Login";
import PdfViewer from "./component/PdfViewer/PdfViewer";
import AllDocument from "./component/AdminDashboard/Document/AllDocument";
import SearchArhiving from "./component/AdminDashboard/SearchArchiving/ArchivingView"
import DraftTable from  "./component/Draft/DraftTable"
import RecentDocument from "./component/AdminDashboard/RecentDocument/RecentDocument";
import ArchiveLayout from "./component/AdminDashboard/Archive/ArchiveLayout"
import DocumentLayout from "./component/AdminDashboard/Document/DocumentsLayout";
import DraftLayout from "./component/Draft/DraftLayout";
import PublicAccessLayout from "./component/PublicAccess/PublicAccessLayout"
import ExpandPDFView from "./component/PublicAccess/ExpandPDFView";
import CommentLayout from "./component/Comments/CommentLayout"
import LogsAndAudit from "./component/LogsAudit/LogsAndAudit";
import UserManagement from "./component/UserManagement/UserManagement"
function App() {
    const router = createBrowserRouter([
        {
            element: <PublicRoute />,
            children: [
                { path: "/", element: <Login /> },
                { path: "/login", element: <Login /> },
                { path: "/public-access", element: <PublicAccessLayout /> },
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
                            element: <ArchiveLayout/>,
                        },
                        {
                            path: "upload-documents",
                            element: <UploadDocuments />,
                        },
                        {
                            path: "view-documents",
                            element: <DocumentLayout/>,
                        },
                        {
                            path: "/dashboard/recent",
                            element:<RecentDocument/>,
                        },
                         {
                            path: "/dashboard/draft",
                            element:<DraftLayout/>,
                        },
                        {
                            path: "/dashboard/user-management",
                            element: <UserManagement/>,
                        },
                        {
                            path: "/dashboard/logs",
                            element: <LogsAndAudit/>,
                        },
                        {
                            path: "pdf-viewer/:fileId",
                            element: <PdfViewer />,
                        },
                         {
                            path: "/dashboard/category",
                            element:<AllDocument/>,
                        },
                          {
                            path: "/dashboard/task-managemnet",
                            element: <h1 className="title">Task and Management</h1>,
                        },
                        {
                            path: "dashboard/settings",
                            element: <h1 className="title">Settings</h1>,
                        },
                         {
                            path: "/dashboard/comments",
                            element:<CommentLayout/>,
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
