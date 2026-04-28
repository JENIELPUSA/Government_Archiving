// component/PublicRoute/PublicRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  // Only redirect IF nasa login or root path
  const isLoginPath = location.pathname === "/" || location.pathname === "/login";

  return token && isLoginPath ? (
    <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />
  ) : (
    <Outlet />
  );
};


export default PublicRoute;