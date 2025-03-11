import React from "react";

const Header = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6 border-l-4 border-yellow-400">
      <h1 className="text-3xl font-semibold text-gray-800">Welcome to Dashboard</h1>
      <p className="text-gray-600">Manage your data and insights here.</p>
    </div>
  );
};

export default Header;