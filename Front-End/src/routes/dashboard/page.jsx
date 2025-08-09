import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import DashboardLayout from "../../component/AdminDashboard/DashboardLayout";
import OfficerDashboard from "../../component/OfficerDashboard.jsx/OfficerDashboard";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext } from "react";

const DashboardPage = () => {
    const { role } = useContext(AuthContext);
    const { theme } = useTheme();
    return (
        <div className="flex flex-col gap-y-4">
            {role === "officer" || role === "approver"|| role === "sbmember" ? <OfficerDashboard /> : <DashboardLayout />}
            <Footer />
        </div>
    );
};

export default DashboardPage;
