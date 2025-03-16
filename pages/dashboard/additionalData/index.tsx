import Layout from "@/components/layouts/Layout";
import JabatanTable from "@/components/core/JabatanTable";
import PtkpTable from "@/components/core/PtkpTable";
import TerTable from "@/components/core/TerTable";

const listDataJabatan: { key: string; jabatan: string; incentive: number }[] = [
  {
    key: "1",
    jabatan: "Karyawan",
    incentive: 0,
  },
  {
    key: "2",
    jabatan: "Leader",
    incentive: 1000000,
  },
  {
    key: "3",
    jabatan: "Manager",
    incentive: 3000000,
  },
  {
    key: "4",
    jabatan: "CEO",
    incentive: 5000000,
  },
  {
    key: "5",
    jabatan: "CTO",
    incentive: 10000000,
  },
];

const listDataPtkp: { key: string; ptkp: string; amount: number }[] = [
  {
    key: "1",
    ptkp: "TK/0",
    amount: 54000000,
  },
  {
    key: "1",
    ptkp: "K/0",
    amount: 58500000,
  },
  {
    key: "1",
    ptkp: "K/1",
    amount: 63000000,
  },
  {
    key: "1",
    ptkp: "K/2",
    amount: 67500000,
  },
  {
    key: "1",
    ptkp: "K/3",
    amount: 72000000,
  },
];

const listDataTer: {
  key: string;
  typeTer: string;
  startRange: number;
  endRange: number;
  ter: number;
}[] = [
  {
    key: "1",
    typeTer: "TER A",
    startRange: 0,
    endRange: 5400000,
    ter: 0,
  },
  {
    key: "2",
    typeTer: "TER A",
    startRange: 5400001,
    endRange: 5650000,
    ter: 0.25,
  },
  {
    key: "3",
    typeTer: "TER A",
    startRange: 5650001,
    endRange: 5950000,
    ter: 0.5,
  },
  {
    key: "4",
    typeTer: "TER A",
    startRange: 5950001,
    endRange: 6300000,
    ter: 0.75,
  },
  {
    key: "5",
    typeTer: "TER A",
    startRange: 6300001,
    endRange: 6750000,
    ter: 1,
  },
  {
    key: "6",
    typeTer: "TER A",
    startRange: 6750001,
    endRange: 7500000,
    ter: 1.25,
  },
  {
    key: "7",
    typeTer: "TER A",
    startRange: 7500001,
    endRange: 8550000,
    ter: 1.5,
  },
  {
    key: "8",
    typeTer: "TER A",
    startRange: 8550001,
    endRange: 9650000,
    ter: 1.75,
  },
  {
    key: "9",
    typeTer: "TER A",
    startRange: 9650001,
    endRange: 10050000,
    ter: 2,
  },
  {
    key: "10",
    typeTer: "TER A",
    startRange: 10050001,
    endRange: 10350000,
    ter: 2.25,
  },
];

export default function AdditionalDataPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-md grid-rows-2 flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Data Jabatan
            </h1>
            <JabatanTable data={listDataJabatan} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md grid-rows-2 flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Data PTKP
            </h1>
            <PtkpTable data={listDataPtkp} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-md grid-rows-2 flex flex-col">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Data TER</h1>
          <TerTable data={listDataTer} />
        </div>
      </div>
    </Layout>
  );
}
