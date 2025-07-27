import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import SocketListener from "./component/socket/SocketListener.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StorageOptimizationProvider } from "./contexts/StorageOptimization/StorageOptimization.jsx";
import { FilesDisplayProvider } from "./contexts/FileContext/FileContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { UserDisplayProvider } from "./contexts/UserContext/userContext.jsx";
import { DepartmentDisplayProvider } from "./contexts/DepartmentContext/DepartmentContext.jsx";
import { OfficerDisplayProvider } from "./contexts/OfficerContext/OfficerContext.jsx";
import { CommentDisplayProvider } from "./contexts/CommentsContext/CommentsContext.jsx";
import { RatingDisplayProvider } from "./contexts/RatingContext/RatingContext.jsx";
import { CategoryDisplayProvider } from "./contexts/CategoryContext/CategoryContext.jsx";
import { LogsDisplayProvider } from "./contexts/LogsAndAuditContext/LogsAndAuditContext.jsx";
import { NotificationDisplayProvider } from "./contexts/NotificationContext/NotificationContext.jsx";
import { AdminDisplayProvider } from "./contexts/AdminContext/AdminContext.jsx";
import AxiosInterceptor from "./component/AxiosInterceptor.jsx";
import { RetentionDisplayProvider } from "./contexts/RetentionContext/RetentionContext.jsx";
import { UpdateDisplayProvider } from "./contexts/UpdateContext/updateContext.jsx";
createRoot(document.getElementById("root")).render(
    // <StrictMode>
    <AuthProvider>
        <StorageOptimizationProvider>
            <UpdateDisplayProvider>
                <RetentionDisplayProvider>
                    <AdminDisplayProvider>
                        <NotificationDisplayProvider>
                            <LogsDisplayProvider>
                                <CategoryDisplayProvider>
                                    <RatingDisplayProvider>
                                        <CommentDisplayProvider>
                                            <OfficerDisplayProvider>
                                                <DepartmentDisplayProvider>
                                                    <UserDisplayProvider>
                                                        <FilesDisplayProvider>
                                                            <SocketListener />
                                                            <App />
                                                            <AxiosInterceptor />
                                                            <ToastContainer
                                                                position="top-right"
                                                                autoClose={3000}
                                                                hideProgressBar={false}
                                                                newestOnTop
                                                                closeOnClick
                                                                pauseOnHover
                                                                draggable
                                                                theme="light"
                                                            />
                                                        </FilesDisplayProvider>
                                                    </UserDisplayProvider>
                                                </DepartmentDisplayProvider>
                                            </OfficerDisplayProvider>
                                        </CommentDisplayProvider>
                                    </RatingDisplayProvider>
                                </CategoryDisplayProvider>
                            </LogsDisplayProvider>
                        </NotificationDisplayProvider>
                    </AdminDisplayProvider>
                </RetentionDisplayProvider>
            </UpdateDisplayProvider>
        </StorageOptimizationProvider>
    </AuthProvider>,
    // </StrictMode>
);
