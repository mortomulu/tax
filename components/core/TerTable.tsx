import React, { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons/lib";
import type { InputRef, TableColumnsType, TableColumnType } from "antd/lib";
import { Button, Dropdown, Input, Space, Table } from "antd/lib";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatRupiah } from "@/utils/currency";
import { useRouter } from "next/router";

interface DataType {
  id: string;
  typeTer: string;
  startRange: number;
  endRange: number;
  ter: number;
}

type DataIndex = keyof DataType;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

interface TerTable {
  data: DataType[];
}

const TerTable: React.FC<TerTable> = ({ data }) => {
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
      title: "Jenis TER",
      dataIndex: "typeTer",
      key: "typeTer",
      width: "20%",
      ...getColumnSearchProps("typeTer"),
    },
    {
      title: "Start Range",
      dataIndex: "startRange",
      key: "startRange",
      width: "10%",
      sorter: (a, b) => a.startRange - b.startRange,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
    },
    {
      title: "End Range",
      dataIndex: "endRange",
      key: "endRange",
      width: "10%",
      sorter: (a, b) => a.endRange - b.endRange,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
    },
    {
      title: "TER",
      dataIndex: "ter",
      key: "ter",
      width: "10%",
      sorter: (a, b) => a.ter - b.ter,
      render: (ter: number) => <span>{ter}%</span>,
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
    if (key === "1") {
      //   router.push(`/dashboard/tax/${record.key}`);
    } else if (key === "2") {
      //   router.push(`/dashboard/tax/${record.key}`);
    } else if (key === "3") {
      //   console.log("Delete:", record.key);
    }
  };

  return (
    <Table<DataType>
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TerTable;
