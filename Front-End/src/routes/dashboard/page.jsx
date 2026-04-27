import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import DashboardLayout from "../../component/AdminDashboard/DashboardLayout";


const DashboardPage = () => {
    return (
        <div className="flex flex-col gap-y-4">
            <DashboardLayout />
            <Footer />
        </div>
    );
};

export default DashboardPage;
