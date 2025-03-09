import Layout from "@/components/layouts/Layout";

export default function Dashboard() {
    return (
      <Layout>
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Welcome to Dashboard</h1>
          <p className="text-gray-600">Manage your data and insights here.</p>
        </div>
  
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Users" value="1,234" color="bg-blue-500" />
          <Card title="Revenue" value="$12,345" color="bg-green-500" />
          <Card title="New Orders" value="56" color="bg-yellow-500" />
        </div>
      </Layout>
    );
  }
  
  /* Card Component */
  const Card = ({ title, value, color }: { title: string; value: string; color: string }) => {
    return (
      <div className={`p-6 rounded-lg shadow-md text-white ${color}`}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  };