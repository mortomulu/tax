import React, { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons/lib";
import type { InputRef, TableColumnsType, TableColumnType } from "antd/lib";
import { Button, Dropdown, Input, Space, Table } from "antd/lib";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatRupiah } from "@/utils/currency";

interface DataType {
  key: string;
  name: string;
  ptkp: string;
  gajiPokok: number;
  gajiBruto: number;
  gajiNeto: number;
  monthlyTax: number;
}

type DataIndex = keyof DataType;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

const data: DataType[] = [
  {
    key: "1",
    name: "Sumarmo",
    ptkp: "K/2",
    gajiPokok: 4100000,
    gajiBruto: 4100000,
    gajiNeto: 4100000,
    monthlyTax: 0,
  },
  {
    key: "2",
    name: "Edi Wahyono",
    ptkp: "K/2",
    gajiPokok: 3600000,
    gajiBruto: 3600000,
    gajiNeto: 3600000,
    monthlyTax: 0,
  },
  {
    key: "3",
    name: "Dimas Maulana Walidayni",
    ptkp: "TK/0",
    gajiPokok: 1700000,
    gajiBruto: 1700000,
    gajiNeto: 1700000,
    monthlyTax: 0,
  },
  {
    key: "4",
    name: "Priyo Adi Prayogo",
    ptkp: "TK/0",
    gajiPokok: 1560000,
    gajiBruto: 1560000,
    gajiNeto: 1560000,
    monthlyTax: 0,
  },
  {
    key: "5",
    name: "Andika Adnan Husaini",
    ptkp: "TK/0",
    gajiPokok: 1600000,
    gajiBruto: 1600000,
    gajiNeto: 1600000,
    monthlyTax: 0,
  },
  {
    key: "6",
    name: "Puji Suryanto",
    ptkp: "TK/0",
    gajiPokok: 1447000,
    gajiBruto: 1447000,
    gajiNeto: 1447000,
    monthlyTax: 0,
  },
  {
    key: "7",
    name: "Abdullah Wafi ",
    ptkp: "K/2",
    gajiPokok: 1447000,
    gajiBruto: 1447000,
    gajiNeto: 1447000,
    monthlyTax: 0,
  },
  {
    key: "8",
    name: "Sri Pujo Adi",
    ptkp: "TK/0",
    gajiPokok: 1447000,
    gajiBruto: 1447000,
    gajiNeto: 1447000,
    monthlyTax: 0,
  },
  {
    key: "9",
    name: "Khairus saleh,SP",
    ptkp: "K/0",
    gajiPokok: 1447000,
    gajiBruto: 1447000,
    gajiNeto: 1447000,
    monthlyTax: 0,
  },
  {
    key: "10",
    name: "Dandi kurnia Putra",
    ptkp: "TK/0",
    gajiPokok: 1447000,
    gajiBruto: 1447000,
    gajiNeto: 1447000,
    monthlyTax: 0,
  },
];

const AnotherTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

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
      width: "25%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "PTKP",
      dataIndex: "ptkp",
      key: "ptkp",
      width: "10%",
      //   ...getColumnSearchProps("ptkp"),
    },
    {
      title: "Gaji Pokok",
      dataIndex: "gajiPokok",
      key: "gajiPokok",
      width: "15%",
      render: (price: number) => <span>{formatRupiah(price)}</span>, // Format Rupiah
      //   ...getColumnSearchProps("gajiPokok"),
      //   sorter: (a, b) => a.gajiPokok.length - b.gajiPokok.length,
      //   sortDirections: ["descend", "ascend"],
    },
    {
      title: "Gaji Bruto",
      dataIndex: "gajiBruto",
      key: "gajiBruto",
      width: "15%",
      render: (price: number) => <span>{formatRupiah(price)}</span>, // Format Rupiah
      //   ...getColumnSearchProps("gajiBruto"),
    },
    {
      title: "Gaji Neto",
      dataIndex: "gajiNeto",
      key: "gajiNeto",
      width: "15%",
      render: (price: number) => <span>{formatRupiah(price)}</span>, // Format Rupiah
      //   ...getColumnSearchProps("gajiBruto"),
    },
    {
      title: "Pajak Bulanan",
      dataIndex: "monthlyTax",
      key: "monthlyTax",
      width: "15%",
      render: (price: number) => <span>{formatRupiah(price)}</span>, // Format Rupiah
      //   ...getColumnSearchProps("monthlyTax"),
    },
    {
      title: "Action",
      key: "operation",
      width: "15%",
      render: () => (
        <Space size="middle">
          <Dropdown menu={{ items }}>
            <a>
              <BsThreeDotsVertical />
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Table<DataType>
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 5 }} // 👈 Batasi 3 item per halaman
    />
  );
};

export default AnotherTable;
