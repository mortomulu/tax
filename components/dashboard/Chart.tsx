import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LineChart = () => {
  const options = {
    chart: {
      id: "basic-line",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    },
    colors: ["#F59E0B"],
  };

  const series = [
    {
      name: "Sales",
      data: [30, 40, 45, 50, 49, 60, 70],
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Tax Overview</h2>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default LineChart;