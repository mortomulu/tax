import Layout from "@/components/layouts/Layout";
import Header from "@/components/dashboard/Header";
import Card from "@/components/dashboard/Card";
import LineChart from "@/components/dashboard/Chart";
import { FaUsers, FaDollarSign } from "react-icons/fa";
import { TbTax } from "react-icons/tb";
import { DatePicker } from "antd";
import { useEffect, useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { supabase } from "@/utils/supabase";
import { formatRupiah } from "@/utils/currency";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function Dashboard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const defaultValue = dayjs(`${year}-${month}-23`, "YYYY-MM-DD");

  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  const [employeesTotal, setEmployeesTotal] = useState<any>();
  const [taxPayTotal, setTaxPayTotal] = useState<any>();
  const [salaryPayTotal, setSalaryPayTotal] = useState<any>();
  const [chartTaxMonth, setChartTaxMonth] = useState<any>();
  const [chartTax, setChartTax] = useState<any>();

  // const handleMonthChange = (date: any) => {
  //   if (date) {
  //     setSelectedMonth(date);
  //     message.success(`Selected Month: ${date.format("MMMM YYYY")}`);
  //   } else {
  //     setSelectedMonth(null);
  //     message.info("No month selected.");
  //   }
  // };

  const fetchEmployees = async () => {
    const { count, error } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching employees:", error);
      message.error("Gagal mengambil data karyawan");
    } else {
      setEmployeesTotal(count || 0);
    }
  };

  const fetchTaxesSummary = async () => {
    const { data, error } = await supabase
      .from("summary_monthly_tax")
      .select("year, month, total_netto_salary, total_monthly_tax");

    if (error) {
      console.error("Error fetching tax summary:", error);
      message.error("Gagal mengambil taxes summary");
      return;
    }

    const totalTax = data?.reduce(
      (acc: number, tax: any) => acc + Number(tax.total_monthly_tax || 0),
      0
    );
    setTaxPayTotal(totalTax);

    const totalPay = data?.reduce(
      (acc: number, tax: any) => acc + Number(tax.total_netto_salary || 0),
      0
    );
    setSalaryPayTotal(totalPay);

 
    
    const chartArray = data
      ?.sort((a, b) => a.month - b.month) 
      .map((item: any) => ({
        month: monthNames[item.month - 1],
        total: Number(item.total_monthly_tax || 0),
      }));
    
    const categories = chartArray?.map((item) => item.month);
    const dataSeries = chartArray?.map((item) => item.total);
    
    setChartTaxMonth(categories);
    setChartTax(dataSeries);
  };

  useEffect(() => {
    fetchEmployees();
    fetchTaxesSummary();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <Header />

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card
          title="Total Karyawan"
          value={employeesTotal}
          color="bg-blue-600"
          icon={<FaUsers className="text-white" />}
        />
        <Card
          title="Total Gaji Dibayar"
          value={formatRupiah(salaryPayTotal)}
          color="bg-green-600"
          icon={<FaDollarSign className="text-white" />}
        />
        <Card
          title="Total Pajak Dibayar"
          value={formatRupiah(taxPayTotal)}
          color="bg-yellow-500"
          icon={<TbTax className="text-white" />}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart chartTax={chartTax} chartTaxMonth={chartTaxMonth}/>
        <div className="bg-white p-6 rounded-lg shadow-md  flex flex-col">
          <div className="mb-6">
            <div className="p-6 rounded-lg shadow-md border-l-4 bg-indigo-950 text-white border-yellow-400">
              <h2 className="text-xl font-semibold text-white mb-4">
                Archive Laporan Pajak Per Bulan
              </h2>
              <DatePicker
                value={defaultValue}
                className="w-full md:w-64 !bg-white !text-black"
                disabled
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
