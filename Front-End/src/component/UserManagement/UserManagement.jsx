import React, { useContext, useState } from "react";
import { Plus, Folder } from "lucide-react";
import UserTable from "./UserTable";
const UserManagement = ({}) => {
    return (
        <div className="mx-auto w-full max-w-6xl rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <div className="mt-4">
                <UserTable />
            </div>
        </div>
    );
};

export default UserManagement;
