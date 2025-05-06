import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons/lib";
import type { InputRef, TableColumnsType, TableColumnType } from "antd/lib";
import {
  Button,
  Dropdown,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from "antd/lib";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatRupiah } from "@/utils/currency";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import {
  calculateBrutoSalary,
  getTypeTer,
  getTerArt21,
  calcMonthlyTax,
} from "@/helpers/taxCalc";
import { calcDecTax, calcDecTaxFinal } from "@/helpers/decTaxCalc";

interface DataType {
  id: string;
  idName: string;
  name: string;
  position: string;
  positionAllowance: number;
  ptkp: string;
  thp: number;
  incentive: number;
  overtimeAllowance: number;
  jkk: number;
  jkm: number;
  bpjs: number;
  bonus: number;
  thr: number;
  nettoSalary: number;
  brutoSalary: number;
  monthlyTax: number;
}

type DataIndex = keyof DataType;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

interface AnotherTableProps {
  data: DataType[];
  fetchAllTaxData: () => void;
  employeeOptions: any;
}

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

const AnotherTable: React.FC<AnotherTableProps> = ({
  data,
  fetchAllTaxData,
  employeeOptions,
}) => {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const [filteredData, setFilteredData] = useState<any>();

  const [ter, setTer] = useState<any>();
  const [ptkp, setPtkp] = useState<any>();

  const fetchTer = async () => {
    const { data, error } = await supabase.from("ter").select(`*`);

    if (error) {
      console.error("Error fetching ter data:", error);
      message.error("Error fetching ter data");
      return [];
    }

    setTer(data);
  };

  const fetchPtkp = async () => {
    const { data: ptkp, error: fetchPtkpError } = await supabase
      .from("ptkp")
      .select("ptkp, amount");

    if (fetchPtkpError) {
      console.error("Error fetching ptkp data:", fetchPtkpError);
      message.error("Error fetching ptkp data");
      return [];
    }

    setPtkp(ptkp);
  };

  useEffect(() => {
    fetchTer();
    fetchPtkp();
  }, []);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (!selectedRecord) return;

    const gaji = parseFloat(selectedRecord.thp) || 0;

    const updatedRecord = {
      ...selectedRecord,
      jkk: (gaji * 0.89) / 100,
      jkm: (gaji * 0.3) / 100,
      bpjs: (gaji * 4) / 100,
    };

    setSelectedRecord(updatedRecord);
  }, [selectedRecord?.thp]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = data.filter((item: any) =>
      item.name.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: TableColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Jabatan",
      dataIndex: "position",
      key: "position",
      width: "20%",
    },
    {
      title: "PTKP",
      dataIndex: "ptkp",
      key: "ptkp",
      width: "10%",
      filters: [
        {
          text: "TK/0",
          value: "TK/0",
        },
        {
          text: "K/0",
          value: "K/0",
        },
        {
          text: "K/1",
          value: "K/1",
        },
        {
          text: "K/2",
          value: "K/2",
        },
        {
          text: "K/3",
          value: "K/3",
        },
      ],
      onFilter: (value, record) => record.ptkp.indexOf(value as string) === 0,
    },
    {
      title: "Gaji Bersih",
      dataIndex: "thp",
      key: "thp",
      width: "15%",
      sorter: (a, b) => a.thp - b.thp,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
    },
    {
      title: "Gaji Bruto",
      dataIndex: "brutoSalary",
      key: "brutoSalary",
      width: "15%",
      sorter: (a, b) => a.brutoSalary - b.brutoSalary,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
    },
    {
      title: "Pajak Bulanan",
      dataIndex: "monthlyTax",
      key: "monthlyTax",
      width: "15%",
      sorter: (a, b) => a.monthlyTax - b.monthlyTax,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
    },
    {
      title: "Action",
      key: "operation",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Dropdown
            menu={{
              items: items.map((item) => ({
                ...item,
                onClick: () => handleMenuClick(item.key, record),
              })),
            }}
          >
            <a>
              <BsThreeDotsVertical />
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const handleMenuClick = (key: string, record: any) => {
    setSelectedRecord(record);
    if (key === "1") {
      router.push(`/dashboard/tax/${record.idName}`);
    } else if (key === "2") {
      setIsEditModalVisible(true);
    } else if (key === "3") {
      setIsDeleteModalVisible(true);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tax").delete().eq("id", id);

    if (error) {
      console.error("Error deleting data:", error);
      message.error("Gagal menghapus data");
    } else {
      message.success("Data berhasil dihapus");
      fetchAllTaxData();
    }
  };

  const handleEditTax = async () => {
    const typeTer = getTypeTer(selectedRecord.ptkp);

    const brutoSalary = calculateBrutoSalary(
      Number(selectedRecord?.newGajiPokok) || 0,
      Number(selectedRecord?.positionAllowance) || 0,
      Number(selectedRecord?.incentive) || 0,
      Number(selectedRecord?.overtimeAllowance) || 0,
      Number(selectedRecord?.jkk) || 0,
      Number(selectedRecord?.jkm) || 0,
      Number(selectedRecord?.bpjs) || 0,
      Number(selectedRecord?.bonus) || 0,
      Number(selectedRecord?.thr) || 0
    );

    const terArt = getTerArt21(brutoSalary, typeTer, ter);
    let monthlyTax = 0;

    if (terArt !== null && terArt !== 0) {
      monthlyTax = calcMonthlyTax(brutoSalary, terArt);
    }

    let decTax = undefined;

    if (month === 12) {
      const { data: monthlyTaxData } = await supabase
        .from("monthly_tax_archive")
        .select("month, tax_total, bruto_salary")
        .eq("idemployee", selectedRecord?.idName)
        .eq("year", year)
        .lt("month", 12);

      const totalTax11 =
        monthlyTaxData?.reduce((sum, item) => sum + (item.tax_total || 0), 0) ??
        0;

      const totalBruto11 =
        monthlyTaxData?.reduce(
          (sum, item) => sum + (item.bruto_salary || 0),
          0
        ) ?? 0;

      const yearlyBruto = totalBruto11 + (selectedRecord.brutosalary || 0);
      const ptkpEmployee = ptkp.find(
        (item: any) => item.ptkp === selectedRecord.ptkp
      );

      if (!ptkpEmployee) {
        console.warn(`PTKP tidak ditemukan untuk ID ${selectedRecord.name}`);
        return;
      }

      const totalTaxable = calcDecTax(yearlyBruto, ptkpEmployee.amount);
      const yearlyPPh = calcDecTaxFinal(totalTaxable);
      decTax = Math.max(yearlyPPh - totalTax11, 0);
    }

    const { data, error } = await supabase
      .from("tax")
      .update({
        idemployee: selectedRecord?.idName,
        thp: Number(selectedRecord?.thp),
        incentive: Number(selectedRecord?.incentive),
        overtime_allowance: Number(selectedRecord?.overtimeAllowance),
        jkk: Number(selectedRecord?.jkk),
        jkm: Number(selectedRecord?.jkm),
        bpjs: Number(selectedRecord?.bpjs),
        bonus: Number(selectedRecord?.bonus),
        thr: Number(selectedRecord?.thr),
        brutosalary: Number(brutoSalary),
        monthlytax: Number(monthlyTax),
        ...(month === 12 && { dectax: Number(decTax) }),
      })
      .eq("id", selectedRecord?.idName);

    if (error) {
      message.error("Gagal update data pajak");
      console.error("Gagal update data pajak:", error.message);
      return false;
    } else {
      fetchAllTaxData();
      setSelectedRecord(null);
      message.success("Berhasil update data pajak");
      return true;
    }
  };

  return (
    <div className="mt-4">
      <Input
        placeholder="Cari berdasarkan Nama"
        value={searchText}
        onChange={handleGlobalSearch}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table<DataType>
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
      />

      {/* modal edit */}
      <Modal
        title="Edit Data"
        open={isEditModalVisible}
        onOk={() => {
          setIsEditModalVisible(false);
          handleEditTax();
        }}
        onCancel={() => {
          setSelectedRecord(null);
          setIsEditModalVisible(false);
        }}
        okText="Simpan"
      >
        <Select
          placeholder="Pilih Karyawan"
          value={selectedRecord?.idName || undefined}
          onChange={(value) =>
            setSelectedRecord({ ...selectedRecord, idName: value })
          }
          className="mb-3"
          style={{ width: "100%" }}
        >
          {employeeOptions?.map((option: any) => (
            <Select.Option key={option.id} value={option.id}>
              {option.name}
            </Select.Option>
          ))}
        </Select>
        <Input
          value={selectedRecord?.thp}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, thp: e.target.value })
          }
          placeholder="Masukkan THP"
          className="mb-3"
        />
        <Input
          value={selectedRecord?.positionAllowance}
          onChange={(e) =>
            setSelectedRecord({
              ...selectedRecord,
              positionAllowance: e.target.value,
            })
          }
          placeholder="Masukkan Position Allowance"
          className="mb-3"
          disabled
        />
        <Input
          value={selectedRecord?.incentive}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, incentive: e.target.value })
          }
          placeholder="Masukkan Incentive"
          className="mb-3"
        />
        <Input
          value={selectedRecord?.overtimeAllowance}
          onChange={(e) =>
            setSelectedRecord({
              ...selectedRecord,
              overtimeAllowance: e.target.value,
            })
          }
          placeholder="Masukkan Overtime Allowance"
          className="mb-3"
        />
        <Input
          value={selectedRecord?.jkk}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, jkk: e.target.value })
          }
          placeholder="Masukkan Employement Injury Security/JKK"
          className="mb-3"
          disabled
        />
        <Input
          value={selectedRecord?.jkm}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, jkm: e.target.value })
          }
          placeholder="Masukkan Death Security/JKM"
          className="mb-3"
          disabled
        />
        <Input
          value={selectedRecord?.bpjs}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, bpjs: e.target.value })
          }
          placeholder="Masukkan BPJS Health/Jaminan Kesehatan"
          className="mb-3"
          disabled
        />
        <Input
          value={selectedRecord?.bonus}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, bonus: e.target.value })
          }
          placeholder="Masukkan Bonus"
          className="mb-3"
        />
        <Input
          value={selectedRecord?.thr}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, thr: e.target.value })
          }
          placeholder="Masukkan Religius Holiday Allowance/THR"
          className="mb-3"
        />
      </Modal>

      {/* modal delete */}
      <Modal
        title="Hapus Data"
        open={isDeleteModalVisible}
        onOk={() => {
          handleDelete(selectedRecord?.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Hapus"
        okButtonProps={{ danger: true }}
      >
        <p>
          Yakin ingin menghapus data <strong>{selectedRecord?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default AnotherTable;
