import Layout from "@/components/layouts/Layout";
import TransferTable from "@/components/core/archieve/TransferTable";
import { Select, Space } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

const { Option } = Select;

const AddArchieveManuallyPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    dayjs().month() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    dayjs().year()
  );

  const currentYear = dayjs().year();
  const years = Array.from({ length: 1 }, (_, i) => currentYear - i);
  const months = [
    { label: "Januari", value: 1 },
    { label: "Februari", value: 2 },
    { label: "Maret", value: 3 },
    { label: "April", value: 4 },
    { label: "Mei", value: 5 },
    { label: "Juni", value: 6 },
    { label: "Juli", value: 7 },
    { label: "Agustus", value: 8 },
    { label: "September", value: 9 },
    { label: "Oktober", value: 10 },
    { label: "November", value: 11 },
    { label: "Desember", value: 12 },
  ];

  return (
    <Layout>
      <div className="flex justify-end mb-4">
        <Space>
          <Select
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val)}
            style={{ width: 150 }}
            placeholder="Pilih Bulan"
          >
            {months.map((month) => (
              <Option key={month.value} value={month.value}>
                {month.label}
              </Option>
            ))}
          </Select>

          <Select
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
            style={{ width: 120 }}
            placeholder="Pilih Tahun"
          >
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <TransferTable month={selectedMonth} year={selectedYear} />
    </Layout>
  );
};

export default AddArchieveManuallyPage;
