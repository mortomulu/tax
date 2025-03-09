import { useState } from "react";
import Layout from "@/components/layouts/Layout";
import Table from "@/components/core/Table";
import AnotherTable from "@/components/core/AnotherTable";

export default function List() {
  const [data, setData] = useState([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Doe", email: "jane@example.com" },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handleAdd = () => {
    if (newName && newEmail) {
      setData([...data, { id: data.length + 1, name: newName, email: newEmail }]);
      setNewName("");
      setNewEmail("");
      setIsOpen(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">List Data Karyawan</h1>
          <button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Add Data
          </button>
        </div>
        {/* <Table data={data} /> */}
        <AnotherTable/>
      </div>

      {/* Modal Add Data */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Data</h2>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border p-2 mb-2 rounded"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full border p-2 mb-4 rounded"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleAdd} className="bg-green-500 text-white px-4 py-2 rounded">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
