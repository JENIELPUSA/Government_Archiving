import React, { useContext, useState, useEffect, useCallback } from "react";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import RoleSelection from "./RoleSelection";
import Dashboard from "./Dashboard";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";

export default function UserManagement() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    const { isAdmin, DeleteAdmin, UpdateAdmin, FetchAdminData } = useContext(AdminDisplayContext);

    const [newItem, setNewItem] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        gender: "",
    });

    const [editUserData, setEditUserData] = useState(null);
    const [formMessage, setFormMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRefresh = useCallback(async () => {
        try {
            if (selectedRole === "Admin") {
                const adminData = await FetchAdminData();
                const transformedAdminData = (adminData || [])
                    .filter((admin) => admin && admin._id)
                    .map((admin) => ({
                        id: admin._id,
                        first_name: admin.first_name,
                        middle_name: admin.middle_name,
                        last_name: admin.last_name,
                        email: admin.email,
                        gender: admin.gender,
                    }));
                setTableData(transformedAdminData);
            }
        } catch (error) {
            console.error("Refresh error:", error);
        }
    }, [selectedRole, FetchAdminData]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setShowTable(true);
    };

    useEffect(() => {
        if (selectedRole === "Admin" && isAdmin?.length > 0) {
            const transformedAdminData = isAdmin
                .filter((admin) => admin && admin._id)
                .map((admin) => ({
                    id: admin._id,
                    first_name: admin.first_name,
                    middle_name: admin.middle_name,
                    last_name: admin.last_name,
                    email: admin.email,
                    gender: admin.gender,
                }));
            setTableData(transformedAdminData);
        }
    }, [selectedRole, isAdmin]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editUserData) {
            setEditUserData((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewItem((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddItem = async () => {
        setIsSubmitting(true);
        const target = editUserData || newItem;

        if (
            !target.first_name.trim() ||
            !target.middle_name.trim() ||
            !target.last_name.trim() ||
            !target.email.trim() ||
            !target.gender.trim()
        ) {
            setFormMessage("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...target,
            role: "admin",
        };

        try {
            // NOTE: AddPatient function from OfficerContext is removed.
            // You will need to replace this with the correct function for adding an admin.
            // For now, I've commented out the line that previously used AddPatient.
            // await AddPatient(payload, selectedRole);

            resetForm();
            setFormMessage("");
            setShowAddUserModal(false);
            await handleRefresh();
        } catch (error) {
            console.error("Add user error:", error);
            setFormMessage("Something went wrong while adding the user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditData = async (editedData) => {
        setIsSubmitting(true);
        try {
            await UpdateAdmin(editedData.id, editedData);
            setEditUserData(null);
            setShowAddUserModal(false);
            await handleRefresh();
        } catch (error) {
            console.error("Edit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await DeleteAdmin(id);
            await handleRefresh();
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    const resetForm = () => {
        setNewItem({
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            gender: "",
        });
        setFormMessage("");
        setEditUserData(null);
    };

    const resetSelection = () => {
        setSelectedRole(null);
        setShowTable(false);
        setTableData([]);
        resetForm();
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans text-gray-800 transition-colors duration-300 dark:from-gray-900 dark:to-gray-950 dark:text-white">
            {isSubmitting && <LoadingOverlay />}

            {!showTable ? (
                <RoleSelection
                    onSelectRole={handleRoleSelect}
                    selectedRole={selectedRole}
                />
            ) : (
                <Dashboard
                    selectedRole={selectedRole}
                    resetSelection={resetSelection}
                    tableData={tableData}
                    handleDeleteItem={handleDeleteItem}
                    showAddUserModal={showAddUserModal}
                    setShowAddUserModal={setShowAddUserModal}
                    newItem={newItem}
                    editUserData={editUserData}
                    setEditUserData={setEditUserData}
                    handleInputChange={handleInputChange}
                    handleAddItem={handleAddItem}
                    handleEditData={handleEditData}
                    formMessage={formMessage}
                    isSubmitting={isSubmitting}
                    setFormMessage={setFormMessage}
                    onRefresh={handleRefresh}
                />
            )}
        </div>
    );
}