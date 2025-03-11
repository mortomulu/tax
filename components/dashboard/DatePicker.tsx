import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  onDateChange: (date: Date) => void;
}

const CustomDatePicker = ({ onDateChange }: DatePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  const handleDateChange = (date: Date) => {
    setStartDate(date);
    onDateChange(date);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col">
        <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
          Pilih Bulan dan Tahun
        </label>
        <DatePicker
          id="date-picker"
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <button
        onClick={() => {
          if (startDate) {
            alert(`Meng-archive laporan pajak untuk bulan ${startDate.toLocaleString("default", { month: "long", year: "numeric" })}`);
            // Tambahkan logika untuk meng-archive laporan di sini
          }
        }}
        className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
      >
        Archive Laporan
      </button>
    </div>
  );
};

export default CustomDatePicker;