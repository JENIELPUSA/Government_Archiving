import CategoryTable from "./CategoryTable";
const ManageCategory = ({}) => {
    return (
        <div className="mx-auto w-full max-w-5xl rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <div className="mt-4">
                <CategoryTable />
            </div>
        </div>
    );
};

export default ManageCategory;
