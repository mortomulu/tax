import Layout from "@/components/layouts/Layout";
import Header from "@/components/dashboard/Header";
import Card from "@/components/dashboard/Card";
import LineChart from "@/components/dashboard/Chart";
import { FaUsers, FaDollarSign } from "react-icons/fa";
import { TbTax } from "react-icons/tb";
import { DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import { useState } from "react";
import { message } from "antd";

const { RangePicker } = DatePicker;

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  // Handle ketika bulan dipilih
  const handleMonthChange = (date: any) => {
    if (date) {
      setSelectedMonth(date);
      message.success(`Selected Month: ${date.format("MMMM YYYY")}`);
      // Di sini Anda bisa menambahkan logika untuk meng-archive laporan pajak
      console.log("Archive report for:", date.format("MMMM YYYY"));
    } else {
      setSelectedMonth(null);
      message.info("No month selected.");
    }
  };

  return (
    <Layout>
      {/* Header */}
      <Header />

      {/* Date Picker untuk Memilih Bulan */}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card
          title="Total Karyawan"
          value="20"
          color="bg-blue-600"
          icon={<FaUsers className="text-white" />}
        />
        <Card
          title="Revenue"
          value="$12,345"
          color="bg-green-600"
          icon={<FaDollarSign className="text-white" />}
        />
        <Card
          title="Total Pajak"
          value="-"
          color="bg-yellow-500"
          icon={<TbTax className="text-white" />}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart />
        <div className="bg-white p-6 rounded-lg shadow-md  flex flex-col">
          <div className="mb-6">
            <div className="p-6 rounded-lg shadow-md border-l-4 bg-indigo-950 text-white border-yellow-400">
              <h2 className="text-xl font-semibold text-white mb-4">
                Archive Laporan Pajak Per Bulan
              </h2>
              <DatePicker
                picker="day"
                onChange={handleMonthChange}
                className="w-full md:w-64"
                placeholder="Pilih Bulan"
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Activities
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <p className="text-gray-700">New user registered</p>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </li>
              <li className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <p className="text-gray-700">Order #12345 completed</p>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </li>
              <li className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-gray-700">New product added</p>
                <span className="text-sm text-gray-500">1 day ago</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
