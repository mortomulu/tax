import React, { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons/lib";
import type { InputRef, TableColumnsType, TableColumnType } from "antd/lib";
import {
  Button,
  Dropdown,
  Input,
  message,
  Modal,
  Space,
  Table,
} from "antd/lib";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatRupiah } from "@/utils/currency";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";

interface DataType {
  id: string;
  name: string;
  position: string;
  ptkp: string;
  thp: number;
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
}

const AnotherTable: React.FC<AnotherTableProps> = ({
  data,
  fetchAllTaxData,
}) => {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
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
      dataIndex: "nettoSalary",
      key: "nettoSalary",
      width: "15%",
      sorter: (a, b) => a.nettoSalary - b.nettoSalary,
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
      router.push(`/dashboard/tax/${record.key}`);
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

  return (
    <>
      <Table<DataType>
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
      />

      {/* modal edit */}
      <Modal
        title="Edit Data"
        open={isEditModalVisible}
        onOk={() => {
          setIsEditModalVisible(false);
        }}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Simpan"
      >
        <Input
          value={selectedRecord?.name}
          onChange={(e) =>
            setSelectedRecord({ ...selectedRecord, name: e.target.value })
          }
          placeholder="Nama Karyawan"
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
    </>
  );
};

export default AnotherTable;
