import React from "react";
import dynamic from "next/dynamic";
import { formatRupiah } from "@/utils/currency";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LineChart = ({ chartTax, chartTaxMonth }: any) => {
  const options = {
    chart: {
      id: "basic-line",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: chartTaxMonth,
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          return formatRupiah(value);
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return formatRupiah(value);
        },
      },
    },
    colors: ["#F59E0B"],
  };

  const series = [
    {
      name: "Pajak",
      data: chartTax,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Grafik Pembayaran Pajak Bulanan Karyawan
      </h2>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default LineChart;
