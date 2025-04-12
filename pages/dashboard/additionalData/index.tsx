import Layout from "@/components/layouts/Layout";
import JabatanTable from "@/components/core/JabatanTable";
import PtkpTable from "@/components/core/PtkpTable";
import TerTable from "@/components/core/TerTable";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { message } from "antd";

type Position = {
  id: string;
  position: string;
  incentive: number;
};

type PTKP = {
  id: string;
  ptkp: string;
  amount: number;
};

type TER = {
  id: string;
  typeTer: number;
  startRange: number;
  endRange: number;
  ter: number;
};

export default function AdditionalDataPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [ptkps, setPtkps] = useState<any[]>([]);
  const [ters, setTers] = useState<any[]>([]);

  console.log("ters", ters)
  console.log("ptkps", ptkps)

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select("id, position, incentive");

    if (error) {
      message.error("Gagal fetch data positions");
      console.error("Positions error:", error);
    } else {
      setPositions(data);
    }
  };

  const fetchPtkps = async () => {
    const { data, error } = await supabase
      .from("ptkp")
      .select("id, ptkp, amount");

    if (error) {
      message.error("Gagal fetch data PTKP");
      console.error("PTKP error:", error);
    } else {
      setPtkps(data);
    }
  };

  const fetchTers = async () => {
    const { data, error } = await supabase
      .from("ter")
      .select("id, typeTer, startRange, endRange, ter");

    if (error) {
      message.error("Gagal fetch data TER");
      console.error("TER error:", error);
    } else {
      setTers(data);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchPtkps();
    fetchTers();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-md grid-rows-2 flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Data Jabatan
            </h1>
            <JabatanTable data={positions} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md grid-rows-2 flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Data PTKP
            </h1>
            <PtkpTable data={ptkps} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-md grid-rows-2 flex flex-col">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Data TER</h1>
          <TerTable data={ters} />
        </div>
      </div>
    </Layout>
  );
}
