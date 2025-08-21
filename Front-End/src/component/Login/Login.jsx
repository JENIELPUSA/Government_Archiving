import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import LoadingIntro from "../../ReusableFolder/loadingIntro";
import ForgotPassword from "../Login/ForgotPassword";
import logo from "@/assets/logo-login.png";
import { FolderArchive, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginStatusModal from "../../ReusableFolder/LogInStatusModal"; // Import the modal

export default function AuthForm() {
    const [isForgotPassword, setForgotPassword] = useState(false);
    const [loginStatus, setLoginStatus] = useState({
        show: false,
        status: "success",
        message: "",
    });

    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();


    const handleInput = useCallback((event) => {
        const { name, value } = event.target;
        setValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    }, []);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await login(values.email, values.password);

        if (response.success) {
            setLoginStatus({
                show: true,
                status: "success",
                message: "Login successful!",
            });
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setLoginStatus({
                show: true,
                status: "error",
                message: response.message || "Login failed. Please check your credentials.",
            });
        }
    };

    const handleModalClose = () => {
        setLoginStatus((prev) => ({ ...prev, show: false }));
        if (loginStatus.status === "success") {
            navigate("/dashboard");
        }
    };

    // Variants for animations
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <div className="font-inter flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-slate-900 dark:to-slate-800">
            {/* Login Status Modal */}
            <LoginStatusModal
                isOpen={loginStatus.show}
                onClose={handleModalClose}
                status={loginStatus.status}
                customMessage={loginStatus.message}
            />

            {/* Subtle background animation */}
            <motion.div
                className="absolute inset-0 z-0 opacity-20"
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{ backgroundPosition: "100% 100%" }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                style={{
                    backgroundImage: `radial-gradient(circle at top left, rgba(147, 197, 253, 0.3) 0%, transparent 50%),
                                     radial-gradient(circle at bottom right, rgba(165, 180, 252, 0.3) 0%, transparent 50%)`,
                }}
            />

            <motion.div
                className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Left Column - Blue Section */}
                <div className="relative hidden w-2/5 flex-col items-start justify-between overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 p-12 text-white md:flex">
                    {/* Background pattern */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 100%),
                                         linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 100%)`,
                            backgroundSize: "20px 20px",
                        }}
                    ></div>

                    <motion.div
                        className="relative z-10 mb-8 flex items-center gap-2"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                            <FolderArchive className="h-16 w-16 text-blue-800" />
                        </div>
                    </motion.div>

                    <div className="relative z-10">
                        <motion.h1
                            className="mb-4 text-5xl font-extrabold leading-tight"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            Hello, <br /> welcome!
                        </motion.h1>
                        <motion.p
                            className="text-md mb-8 text-blue-100"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.5 }}
                        >
                            This File Archiving System securely organizes, stores, and retrieves PDF documents ensuring fast access, efficient
                            control, and long-term digital preservation.
                        </motion.p>
                    </div>
                    <div className="absolute bottom-4 left-4 text-xs text-blue-300 opacity-50">FREEPIK</div>
                </div>

                {/* Right Column - Login Form */}
                <div className="flex w-full flex-col justify-center bg-white p-8 dark:bg-slate-800 md:w-3/5 md:p-12">
                    <motion.div
                        className="mb-8 text-center"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                    >
                        <div className="mb-6 flex justify-center">
                            <img
                                src={logo}
                                alt="App Logo"
                                className="h-32 w-32 object-contain"
                            />
                        </div>
                        <h2 className="text-center text-3xl font-extrabold leading-tight">
                            <span className="block text-blue-400">Sangguniang Panlalawigan</span>
                            <span className="block text-gray-800 dark:text-gray-100">Archiving System</span>
                        </h2>

                        <p className="text-md mt-2 text-gray-600 dark:text-gray-400">Securely manage your documents</p>
                    </motion.div>

                    <form
                        className="space-y-6"
                        onSubmit={handleLoginSubmit}
                    >
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.7 }}
                        >
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                    size={20}
                                />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={values.email}
                                    onChange={handleInput}
                                    disabled={isLoading}
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                                    placeholder="name@mail.com"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.8 }}
                        >
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                    size={20}
                                />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={values.password}
                                    onChange={handleInput}
                                    disabled={isLoading}
                                    className="focus:ring-600 w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-600 focus:ring-2 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex items-center justify-between text-sm"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.9 }}
                        >
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-gray-900 dark:text-gray-300"
                                >
                                    Remember me
                                </label>
                            </div>
                            <a
                                onClick={() => setForgotPassword(true)}
                                className="cursor-pointer font-medium text-blue-700 hover:text-blue-900 hover:underline dark:text-blue-300 dark:hover:text-blue-100"
                            >
                                Forgot password?
                            </a>
                        </motion.div>

                        <motion.button
                            type="submit"
                            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 ${
                                isLoading
                                    ? "cursor-not-allowed bg-blue-400"
                                    : "active:scale-98 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                            }`}
                            disabled={isLoading}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 1.0 }}
                        >
                            {isLoading ? <LoadingIntro /> : "Login"}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-6 text-center"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1.1 }}
                    ></motion.div>
                </div>

                <ForgotPassword
                    show={isForgotPassword}
                    onClose={() => {
                        setForgotPassword(false);
                    }}
                />
            </motion.div>
        </div>
    );
}
