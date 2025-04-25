import React, { useEffect, useState } from "react";
import { Button, Flex, message, Switch, Table, Tag, Transfer } from "antd";
import type {
  GetProp,
  TableColumnsType,
  TableProps,
  TransferProps,
} from "antd";
import { supabase } from "@/utils/supabase";
import { formatRupiah } from "@/utils/currency";

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

const mockTags = ["cat", "dog", "bird"];

const mockData = Array.from({ length: 20 }).map<DataType>((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
  tag: mockTags[i % 3],
}));

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
];

const filterOption = (input: string, item: DataType) =>
  item.title?.includes(input) || item.tag?.includes(input);

const App: React.FC<any> = ({ month, year }) => {
  const [employees, setEmployees] = useState<any>();
  const [taxes, setTaxes] = useState<any>();
  const [totalTax, setTotalTax] = useState<number>(0);
  const [totalTHP, setTotalTHP] = useState<number>(0);

  const [archieveData, setArchieveData] = useState<any>();

  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([]);
  const [disabled, setDisabled] = useState(false);

  const onChange: TableTransferProps["onChange"] = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

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

  useEffect(() => {
    fetchData();
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

  return (
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
  );
};

export default App;
