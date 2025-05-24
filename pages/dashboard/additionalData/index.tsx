import Layout from "@/components/layouts/Layout";
import JabatanTable from "@/components/core/JabatanTable";
import PtkpTable from "@/components/core/PtkpTable";
import TerTable from "@/components/core/TerTable";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Form, Input, InputNumber, message, Modal, Button } from "antd";
import CompanyProfileForm from "@/components/core/additionalData/CompanyProfileForm";

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
  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_npwp: "",
    loading: true,
  });

  // Modal Visibility
  const [isJabatanModalOpen, setIsJabatanModalOpen] = useState(false);
  const [isPtkpModalOpen, setIsPtkpModalOpen] = useState(false);
  const [isTerModalOpen, setIsTerModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Form Refs
  const [formJabatan] = Form.useForm();
  const [formPtkp] = Form.useForm();
  const [formTer] = Form.useForm();

  const handleAddJabatan = async (values: Position) => {
    const { data, error } = await supabase.from("positions").insert([values]);
    if (error) {
      message.error("Gagal menambahkan jabatan");
    } else {
      message.success("Berhasil menambahkan jabatan");
      fetchPositions();
      formJabatan.resetFields();
      setIsJabatanModalOpen(false);
    }
  };

  const handleAddPtkp = async (values: PTKP) => {
    const { data, error } = await supabase.from("ptkp").insert([values]);
    if (error) {
      message.error("Gagal menambahkan PTKP");
    } else {
      message.success("Berhasil menambahkan PTKP");
      fetchPtkps();
      formPtkp.resetFields();
      setIsPtkpModalOpen(false);
    }
  };

  const handleAddTer = async (values: TER) => {
    const { data, error } = await supabase.from("ter").insert([values]);
    if (error) {
      message.error("Gagal menambahkan TER");
    } else {
      message.success("Berhasil menambahkan TER");
      fetchTers();
      formTer.resetFields();
      setIsTerModalOpen(false);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profile")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) throw error;

      setCompanyData({
        company_name: data?.company_name || "",
        company_npwp: data?.company_npwp || "",
        loading: false,
      });
    } catch (error) {
      message.error("Gagal memuat data perusahaan");
      console.error(error);
      setCompanyData((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select("id, position, incentive");

    if (error) {
      message.error("Gagal fetch data positions");
      console.error("Positions error:", error);
    } else {
      const formatted = data.sort((a, b) =>
        a.position.localeCompare(b.position)
      );
      setPositions(formatted);
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
      const formatted = data.sort((a, b) => a.ptkp.localeCompare(b.ptkp));
      setPtkps(formatted);
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
      const formatted = data.sort((a, b) => a.typeTer.localeCompare(b.typeTer));
      setTers(formatted);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
    fetchPositions();
    fetchPtkps();
    fetchTers();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500 shadow-md flex flex-col">
          <div className="flex flex-row justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Profil Perusahaan
            </h1>
            <Button
              onClick={() => setIsCompanyModalOpen(true)}
              type="primary"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Profil Perusahaan
            </Button>
          </div>

          {/* Data Display */}
          <div className="space-y-3 mt-2">
            <div className="flex items-baseline">
              <span className="text-gray-600 w-32">Nama Perusahaan:</span>
              <span className="font-medium">
                {companyData.loading
                  ? "Memuat..."
                  : companyData.company_name || "-"}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-gray-600 w-32">NPWP Perusahaan:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {companyData.loading
                  ? "Memuat..."
                  : companyData.company_npwp || "Belum diisi"}
              </span>
            </div>
          </div>

          {/* Modal Edit */}
          <CompanyProfileForm
            visible={isCompanyModalOpen}
            onCancel={() => setIsCompanyModalOpen(false)}
            initialValues={{
              company_name: companyData.company_name,
              company_npwp: companyData.company_npwp,
            }}
            onSuccess={() => {
              fetchCompanyProfile();
              setIsCompanyModalOpen(false);
            }}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-md grid-rows-2 flex flex-col">
            <div className="flex flex-row justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Data Jabatan
              </h1>
              <Button
                onClick={() => setIsJabatanModalOpen(true)}
                type="primary"
              >
                Tambah Jabatan
              </Button>
            </div>
            <JabatanTable data={positions} fetchPositions={fetchPositions} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md grid-rows-2 flex flex-col">
            <div className="flex flex-row justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Data PTKP
              </h1>
              <Button onClick={() => setIsPtkpModalOpen(true)} type="primary">
                Tambah PTKP
              </Button>
            </div>
            <PtkpTable data={ptkps} fetchPtkps={fetchPtkps} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-md grid-rows-2 flex flex-col">
          <div className="flex flex-row justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Data TER
            </h1>
            <Button onClick={() => setIsTerModalOpen(true)} type="primary">
              Tambah TER
            </Button>
          </div>
          <TerTable data={ters} fetchTers={fetchTers} />
        </div>
      </div>
      <Modal
        title="Tambah Jabatan"
        open={isJabatanModalOpen}
        onCancel={() => {
          formJabatan.resetFields();
          setIsJabatanModalOpen(false);
        }}
        onOk={() => formJabatan.submit()}
        okText="Simpan Data"
        cancelText="Batal"
      >
        <Form form={formJabatan} layout="vertical" onFinish={handleAddJabatan}>
          <Form.Item
            name="position"
            label="Nama Jabatan"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="incentive"
            label="Position Allowance"
            rules={[{ required: true }]}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) =>
                parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tambah PTKP"
        open={isPtkpModalOpen}
        onCancel={() => {
          formPtkp.resetFields();
          setIsPtkpModalOpen(false);
        }}
        onOk={() => formPtkp.submit()}
        okText="Simpan Data"
        cancelText="Batal"
      >
        <Form form={formPtkp} layout="vertical" onFinish={handleAddPtkp}>
          <Form.Item name="ptkp" label="Nama PTKP" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Jumlah" rules={[{ required: true }]}>
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) =>
                parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tambah TER"
        open={isTerModalOpen}
        onCancel={() => {
          formTer.resetFields();
          setIsTerModalOpen(false);
        }}
        onOk={() => formTer.submit()}
        okText="Simpan Data"
        cancelText="Batal"
      >
        <Form form={formTer} layout="vertical" onFinish={handleAddTer}>
          <Form.Item
            name="typeTer"
            label="Tipe TER"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="startRange"
            label="Start Range"
            rules={[{ required: true }]}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) =>
                parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
              }
            />
          </Form.Item>
          <Form.Item
            name="endRange"
            label="End Range"
            rules={[{ required: true }]}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) =>
                parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
              }
            />
          </Form.Item>
          <Form.Item name="ter" label="TER (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
