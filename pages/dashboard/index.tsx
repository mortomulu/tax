import Layout from "@/components/layouts/Layout";
import Header from "@/components/dashboard/Header";
import Card from "@/components/dashboard/Card";
import LineChart from "@/components/dashboard/Chart";
import {
  FaUsers,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaEye,
  FaInfoCircle,
} from "react-icons/fa";
import { TbTax } from "react-icons/tb";
import { Button, DatePicker, Tag, Upload } from "antd";
import { useEffect, useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { supabase } from "@/utils/supabase";
import { formatRupiah } from "@/utils/currency";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function Dashboard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const monthNumber = today.getMonth() + 1;
  
  const defaultDayjs = dayjs(`${year}-${month}-01`, "YYYY-MM-DD"); 
  const [defaultValue, setDefaultValue] = useState<any>(defaultDayjs);

  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  const [employeesTotal, setEmployeesTotal] = useState<any>();
  const [taxPayTotal, setTaxPayTotal] = useState<any>();
  const [salaryPayTotal, setSalaryPayTotal] = useState<any>();
  const [chartTaxMonth, setChartTaxMonth] = useState<any>();
  const [chartTax, setChartTax] = useState<any>();

  const [summaryTaxLastMonth, setSummaryTaxLastMonth] = useState<any[]>([]);
  const [summaryTaxesCurrentYear, setSummaryTaxesCurrentYear] = useState<any>();
  const [missingSummaryMonths, setMissingSummaryMonths] = useState<number[]>(
    []
  );

  useEffect(() => {
    if (!summaryTaxesCurrentYear) return;

    const existingMonths = summaryTaxesCurrentYear.map((d: any) =>
      Number(d.month)
    );
    const currentMonth = new Date().getMonth() + 1;
    const allMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
    const missing = allMonths.filter((m) => !existingMonths.includes(m));

    setMissingSummaryMonths(missing);
  }, [summaryTaxesCurrentYear]);

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
      .select(
        "year, month, total_netto_salary, total_monthly_tax, payment_proof_url"
      );

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

    const lastMonth = monthNumber === 1 ? 12 : monthNumber - 1;
    const lastYear = monthNumber === 1 ? year - 1 : year;

    const summaryTaxLastMonth = data.filter(
      (item) =>
        Number(item.month) === lastMonth && Number(item.year) === lastYear
    );

    const summaryTaxCurrentYear = data.filter((item) => item.year == year);

    setSummaryTaxesCurrentYear(summaryTaxCurrentYear);
    setChartTaxMonth(categories);
    setChartTax(dataSeries);
    setSummaryTaxLastMonth(summaryTaxLastMonth);
  };

  useEffect(() => {
    fetchEmployees();
    fetchTaxesSummary();
  }, []);

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from("paymentproof")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("paymentproof")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) throw new Error("URL publik tidak ditemukan");

      const lastMonth = monthNumber === 1 ? 12 : monthNumber - 1;
      const lastYear = monthNumber === 1 ? year - 1 : year;

      const { error: updateError } = await supabase
        .from("summary_monthly_tax")
        .update({ payment_proof_url: publicUrl })
        .eq("month", lastMonth)
        .eq("year", lastYear);

      if (updateError) throw updateError;

      fetchTaxesSummary();
      message.success("Upload dan update berhasil!");
      onSuccess?.("OK");
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload gagal!");
      onError?.(error);
    }
  };

  return (
    <Layout>
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

      {/* Payment Status Card - New Addition */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaFileInvoiceDollar className="text-blue-500 mr-2" />
          Status Pelaporan Pajak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">
                Masa {monthNumber && monthNumber - 1}/{year && year}
              </p>
              {summaryTaxLastMonth.length > 0 ? (
                summaryTaxLastMonth[0]?.payment_proof_url === null ? (
                  <Tag color="red" className="!text-sm !py-1 !px-3">
                    Belum Dilapor
                  </Tag>
                ) : (
                  <Tag color="green" className="!text-sm !py-1 !px-3">
                    Dilapor
                  </Tag>
                )
              ) : (
                <Tag color="orange" className="!text-sm !py-1 !px-3">
                  Data Tidak Tersedia
                </Tag>
              )}
            </div>

            <div className="mt-4">
              <p className="text-gray-700 font-medium mb-2">Bukti Pelaporan</p>
              {summaryTaxLastMonth.length > 0 &&
              summaryTaxLastMonth[0]?.payment_proof_url ? (
                <a
                  href={summaryTaxLastMonth[0].payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEye className="mr-2" />
                  Lihat Bukti Pelaporan
                </a>
              ) : summaryTaxLastMonth.length > 0 ? (
                <div>
                  <Upload
                    showUploadList={false}
                    customRequest={(options) => handleUpload(options)}
                    disabled={!summaryTaxLastMonth[0]}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      disabled={!summaryTaxLastMonth[0]}
                      className="flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                    >
                      Upload Bukti
                    </Button>
                  </Upload>
                  {!summaryTaxLastMonth[0] && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <FaInfoCircle className="mr-1" />
                      Belum waktunya untuk upload bukti pelaporan
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 flex items-center">
                  <FaInfoCircle className="mr-1" />
                  Data pelaporan tidak tersedia
                </p>
              )}
            </div>
          </div>

          {/* You can add additional payment-related information here */}
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-700 font-medium mb-3">Informasi Pajak</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Batas Pembayaran:</span> 10{" "}
                {month && monthNames[month]} {year && year}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status Pelaporan:</span>{" "}
                {taxArchieveCurrentPeriod?.reportStatus || "Belum Dilaporkan"}
              </p>
              {taxArchieveCurrentPeriod?.paymentDate && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tanggal Pembayaran:</span>{" "}
                  {formatDate(taxArchieveCurrentPeriod.paymentDate)}
                </p>
              )}
            </div>
          </div> */}

          {/* Date to automate archieve */}
          <div className="mb-6">
            <div className="p-6 rounded-lg shadow-md border-l-4 bg-indigo-950 text-white border-yellow-400">
              <h2 className="text-xl font-semibold text-white mb-4">
                Laporan Pajak Bulanan Diarsipkan Secara Otomatis pada Tanggal
                Berikut
              </h2>
              <DatePicker
                value={defaultValue}
                className="w-full md:w-64 !bg-white !text-black"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart chartTax={chartTax} chartTaxMonth={chartTaxMonth} />
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pengingat Pajak Bulanan Belum Tersedia
            </h2>

            {missingSummaryMonths.length === 0 ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckCircleOutlined className="text-green-600 text-lg" />
                </div>
                <div>
                  <h4 className="text-green-800 font-medium mb-1">
                    Data pajak bulan ini sudah lengkap
                  </h4>
                  <p className="text-green-600 text-sm">
                    Semua laporan pajak telah terarsip dengan baik 🎉
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <ExclamationCircleOutlined className="text-red-500 mr-2" />
                  <h4 className="font-medium text-gray-800">
                    {missingSummaryMonths.length} Bulan Belum Terlapor
                  </h4>
                </div>

                <div className="border rounded-lg divide-y">
                  {missingSummaryMonths.map((month, index) => (
                    <div
                      key={month}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0"></div>
                        <div>
                          <Link
                            href={`/dashboard/archive/add?month=${month}&year=${new Date().getFullYear()}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {monthNames[month - 1]} {new Date().getFullYear()}{" "}
                          </Link>
                          <p className="text-gray-500 text-sm mt-1">
                            Belum ada laporan pajak tersedia
                          </p>
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  <InfoCircleOutlined className="mr-1" />
                  Klik pada bulan untuk melengkapi laporan pajak
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
