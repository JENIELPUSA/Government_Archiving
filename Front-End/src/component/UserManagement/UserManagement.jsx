import React, { useContext, useState } from "react";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import RoleSelection from "./RoleSelection";
import Dashboard from "./Dashboard";

export default function UserManagement() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    const { isOfficer, AddPatient, DeleteOfficer, UpdateOfficer } = useContext(OfficerDisplayContext);
    const { isAdmin, DeleteAdmin, UpdateAdmin } = useContext(AdminDisplayContext);

    const [newItem, setNewItem] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        department: "",
        gender: "",
    });

    const [editUserData, setEditUserData] = useState(null);
    const [formMessage, setFormMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setShowTable(true);
        if (role === "Admin") {
            const transformedAdminData = isAdmin.map((admin) => ({
                id: admin._id,
                first_name: admin.first_name,
                middle_name: admin.middle_name,
                last_name: admin.last_name,
                email: admin.email,
                gender: admin.gender,
            }));
            setTableData(transformedAdminData);
        } else if (role === "Official") {
            const transformedOfficerData = (isOfficer || []).map((officer) => ({
                id: officer._id,
                first_name: officer.first_name,
                middle_name: officer.middle_name,
                last_name: officer.last_name,
                email: officer.email,
                department: officer.department,
                gender: officer.gender,
            }));
            setTableData(transformedOfficerData);
        }
    };

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
            (!target.department?.trim?.() && selectedRole !== "Admin") ||
            !target.gender.trim()
        ) {
            setFormMessage("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        const roleValue = selectedRole === "Admin" ? "admin" : "officer";
        const payload = {
            ...target,
            role: roleValue,
        };
        if (roleValue === "admin") delete payload.department;

        try {
            await AddPatient(payload, selectedRole);
            resetForm();
            setFormMessage("");
            setShowAddUserModal(false);
        } catch (error) {
            console.error("Add user error:", error);
            setFormMessage("Something went wrong while adding the user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditData = async (editedData) => {
        try {
            if (selectedRole === "Admin") {
                await UpdateAdmin(editedData.id, editedData);
            } else {
                await UpdateOfficer(editedData.id, editedData);
            }
            setEditUserData(null);
            setShowAddUserModal(false);
        } catch (error) {
            console.error("Edit error:", error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            if (selectedRole === "Admin") {
                await DeleteAdmin(id);
            } else {
                await DeleteOfficer(id);
            }
            setTableData((prev) => prev.filter((item) => item.id !== id));
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
            department: "",
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 font-sans text-gray-800 dark:text-white transition-colors duration-300">
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
                />
            )}
        </div>
    );
}
