import React from "react";
import dynamic from "next/dynamic";
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
    colors: ["#F59E0B"],
  };

  const series = [
    {
      name: "Tax",
      data: chartTax,
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
