import React, { useEffect, useState } from "react";
import {
  Button,
  Descriptions,
  Dropdown,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Transfer,
} from "antd";
import type {
  GetProp,
  TableColumnsType,
  TableProps,
  TransferProps,
} from "antd";
import { supabase } from "@/utils/supabase";
import { formatRupiah } from "@/utils/currency";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  calculateBrutoSalary,
  getTypeTer,
  getTerArt21,
  calcMonthlyTax,
} from "@/helpers/taxCalc";

type TransferItem = GetProp<TransferProps, "dataSource">[number];
type TableRowSelection<T extends object> = TableProps<T>["rowSelection"];

interface DataType {
  key: string;
  title: string;
  description: string;
  tag: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}

const actionItems = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
];

// Customize Table Transfer
const TableTransfer: React.FC<TableTransferProps> = (props) => {
  const { leftColumns, rightColumns, ...restProps } = props;
  return (
    <Transfer style={{ width: "100%" }} {...restProps}>
      {({
        direction,
        filteredItems,
        onItemSelect,
        onItemSelectAll,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === "left" ? leftColumns : rightColumns;
        const rowSelection: TableRowSelection<TransferItem> = {
          getCheckboxProps: () => ({ disabled: listDisabled }),
          onChange(selectedRowKeys) {
            onItemSelectAll(selectedRowKeys, "replace");
          },
          selectedRowKeys: listSelectedKeys,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        };

        return (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size="small"
            style={{ pointerEvents: listDisabled ? "none" : undefined }}
            onRow={({ key, disabled: itemDisabled }) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) {
                  return;
                }
                onItemSelect(key, !listSelectedKeys.includes(key));
              },
            })}
          />
        );
      }}
    </Transfer>
  );
};

const filterOption = (input: string, item: DataType) =>
  item.title?.includes(input) || item.tag?.includes(input);

const App: React.FC<any> = ({ month, year }) => {
  const [employees, setEmployees] = useState<any>();
  const [taxes, setTaxes] = useState<any>();
  const [totalTax, setTotalTax] = useState<number>(0);
  const [totalTHP, setTotalTHP] = useState<number>(0);

  const [archieveData, setArchieveData] = useState<any>();
  const [ter, setTer] = useState<any>();

  const [selectedRecord, setSelectedRecord] = useState<any>();
  const [isModalDetailOpen, setIsModalDetailOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);

  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([]);
  const [disabled, setDisabled] = useState(false);

  const onChange: TableTransferProps["onChange"] = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  const handleMenuClick = ({ key }: { key: string }, record: any) => {
    if (key === "1") {
      setSelectedRecord(record);
      setIsModalDetailOpen(true);
    } else if (key === "2") {
      setSelectedRecord(record);
      setIsModalEditOpen(true);
    }
  };

  const columns: TableColumnsType<DataType> = [
    {
      dataIndex: "employee_name",
      title: "Name",
    },
    {
      dataIndex: "ptkp",
      title: "PTKP",
      render: (tag: string) => (
        <Tag style={{ marginInlineEnd: 0 }} color="cyan">
          {tag.toUpperCase()}
        </Tag>
      ),
    },
    {
      dataIndex: "tax_total",
      title: "Tax",
      render: (price: number) => <span>{formatRupiah(price)}</span>,
    },
    {
      title: "Action",
      key: "operation",
      width: "15%",
      render: (_: any, record: any) => (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: actionItems.map((item) => ({
                ...item,
                onClick: (e) => handleMenuClick(e, record),
              })),
            }}
          >
            <span style={{ cursor: "pointer" }}>
              <BsThreeDotsVertical />
            </span>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    const { data: employeess, error: fetchEmployeesError } = await supabase
      .from("employees")
      .select(
        `
          id,
          name,
          nik,
          ptkp:ptkp (ptkp),
          positions:idposition (position, incentive)
        `
      );

    if (fetchEmployeesError) {
      message.error("Gagal mengambil data karyawan");
      console.log("fetch employees error:", fetchEmployeesError);
      return;
    }

    setEmployees(employeess);

    const { data: taxess, error: fetchTaxesError } = await supabase
      .from("tax")
      .select("*");

    if (fetchTaxesError) {
      message.error("Gagal mengambil data pajak karyawan");
      console.log("fetch employees error:", fetchTaxesError);
      return;
    }

    setTaxes(taxess);
  };

  const fetchTer = async () => {
    const { data, error } = await supabase.from("ter").select(`*`);

    if (error) {
      console.error("Error fetching ter data:", error);
      return [];
    }

    setTer(data);
  };

  useEffect(() => {
    fetchData();
    fetchTer();
  }, []);

  useEffect(() => {
    let tempTotalTax = 0;
    let tempTotalTHP = 0;

    const archiveData = employees
      ?.map((emp: any, i: number) => {
        const employeeTax = taxes?.find((t: any) => t.idemployee === emp.id);
        if (!employeeTax) return null;

        const taxValue = employeeTax?.monthlytax || 0;
        const thpValue = employeeTax?.thp || 0;

        tempTotalTax += taxValue;
        tempTotalTHP += thpValue;

        return {
          key: i,
          year,
          month,
          idemployee: emp.id,
          employee_name: emp.name,
          nik: emp.nik,
          ptkp: emp.ptkp?.ptkp || null,
          position: emp.positions?.position || null,
          position_allowance: emp.positions?.incentive || 0,
          incentive: employeeTax?.incentive || 0,
          thp: thpValue,
          overtime_allowance: employeeTax?.overtime_allowance || 0,
          jkk: employeeTax?.jkk || 0,
          jkm: employeeTax?.jkm || 0,
          bpjs: employeeTax?.bpjs || 0,
          bonus: employeeTax?.bonus || 0,
          thr: employeeTax?.thr || 0,
          netto_salary: employeeTax?.nettosalary || 0,
          bruto_salary: employeeTax?.brutosalary || 0,
          tax_total: taxValue,
        };
      })
      .filter(Boolean);

    setArchieveData(archiveData);
    setTotalTax(tempTotalTax);
    setTotalTHP(tempTotalTHP);
  }, [month, year, employees, taxes]);

  const handleEditSubmit = (values: any) => {
    const updatedData = archieveData.map((item: any) => {
      if (item.key === selectedRecord.key) {
        const {
          position_allowance,
          incentive,
          overtime_allowance,
          jkk,
          jkm,
          bpjs,
          bonus,
          thr,
        } = values;

        const gajiPokok = item.thp ?? 0;
        const ptkp = item.ptkp;

        const typeTer = getTypeTer(ptkp);

        const brutoSalary = calculateBrutoSalary(
          Number(gajiPokok) || 0,
          Number(position_allowance) || 0,
          Number(incentive) || 0,
          Number(overtime_allowance) || 0,
          Number(jkk) || 0,
          Number(jkm) || 0,
          Number(bpjs) || 0,
          Number(bonus) || 0,
          Number(thr) || 0
        );

        const terArt = getTerArt21(brutoSalary, typeTer, ter);
        let monthlyTax = 0;

        if (terArt !== null && terArt !== 0) {
          monthlyTax = calcMonthlyTax(brutoSalary, terArt);
        }
        return {
          ...item,
          ...values,
          bruto_salary: brutoSalary,
          tax_total: monthlyTax,
        };
      }

      return item;
    });

    // logic to summarize tax and insert that to db
    // logic to insert that monthly employees taxes on db

    setArchieveData(updatedData);
    setIsModalEditOpen(false);
    message.success("Berhasil mengubah data");
  };

  return (
    <>
      <Flex align="start" gap="middle" vertical>
        <TableTransfer
          dataSource={archieveData}
          targetKeys={targetKeys}
          disabled={disabled}
          showSearch
          showSelectAll={false}
          onChange={onChange}
          filterOption={filterOption}
          leftColumns={columns}
          rightColumns={columns}
        />
        <Button
          type="primary"
          className="ml-auto"
          disabled={month === null || year === null}
        >
          Simpan archieve
        </Button>
      </Flex>

      {/* modal detail */}
      <Modal
        open={isModalDetailOpen}
        title="Detail Pajak Karyawan"
        onCancel={() => {
          setSelectedRecord(null);
          setIsModalDetailOpen(false);
        }}
        footer={null}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Nama">
              {selectedRecord.employee_name}
            </Descriptions.Item>
            <Descriptions.Item label="PTKP">
              {selectedRecord.ptkp}
            </Descriptions.Item>
            <Descriptions.Item label="Jabatan">
              {selectedRecord.position}
            </Descriptions.Item>
            <Descriptions.Item label="Tunjangan Jabatan">
              {formatRupiah(selectedRecord.position_allowance)}
            </Descriptions.Item>
            <Descriptions.Item label="Insentif">
              {formatRupiah(selectedRecord.incentive)}
            </Descriptions.Item>
            <Descriptions.Item label="THP">
              {formatRupiah(selectedRecord.thp)}
            </Descriptions.Item>
            <Descriptions.Item label="Lembur">
              {formatRupiah(selectedRecord.overtime_allowance)}
            </Descriptions.Item>
            <Descriptions.Item label="JKK">
              {formatRupiah(selectedRecord.jkk)}
            </Descriptions.Item>
            <Descriptions.Item label="JKM">
              {formatRupiah(selectedRecord.jkm)}
            </Descriptions.Item>
            <Descriptions.Item label="BPJS">
              {formatRupiah(selectedRecord.bpjs)}
            </Descriptions.Item>
            <Descriptions.Item label="Bonus">
              {formatRupiah(selectedRecord.bonus)}
            </Descriptions.Item>
            <Descriptions.Item label="THR">
              {formatRupiah(selectedRecord.thr)}
            </Descriptions.Item>
            <Descriptions.Item label="Netto">
              {formatRupiah(selectedRecord.netto_salary)}
            </Descriptions.Item>
            <Descriptions.Item label="Bruto">
              {formatRupiah(selectedRecord.bruto_salary)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Pajak">
              {formatRupiah(selectedRecord.tax_total)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* modal edit */}
      <Modal
        open={isModalEditOpen}
        title="Edit Data Pajak"
        onCancel={() => {
          setSelectedRecord(null);
          setIsModalEditOpen(false);
        }}
        footer={null}
      >
        {selectedRecord && (
          <Form
            layout="vertical"
            initialValues={selectedRecord}
            onFinish={handleEditSubmit}
          >
            <Form.Item name="employee_name" label="Nama">
              <Input disabled />
            </Form.Item>

            {/* <Form.Item name="position_allowance" label="Tunjangan Jabatan">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item> */}

            <Form.Item name="incentive" label="Insentif">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="bonus" label="Bonus">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="thr" label="THR">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            {/* <Form.Item name="tax_total" label="Pajak">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item> */}

            <Form.Item name="thp" label="THP">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Button htmlType="submit" type="primary" block>
                Simpan Perubahan
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default App;
