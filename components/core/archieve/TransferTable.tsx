import React, { useEffect, useMemo, useState } from "react";
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
  const [companyProfile, setCompanyProfile] = useState<any>();
  const [config, setConfig] = useState({
    jkk_enabled: false,
    jkm_enabled: false,
    bpjs_enabled: false,
    loading: true,
  });

  const [selectedRecord, setSelectedRecord] = useState<any>();
  const [isModalDetailOpen, setIsModalDetailOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);

  const [targetKeys, setTargetKeys]: any = useState<
    TransferProps["targetKeys"]
  >([]);
  const [disabled, setDisabled] = useState(false);

  const [rightSideData, setRightSideData] = useState<any[]>([]);

  const normalizedArchieveData = useMemo(() => {
    return archieveData?.map((item: any) => ({
      ...item,
      key: item.key.toString(),
    }));
  }, [archieveData]);

  useEffect(() => {
    const selectedData = normalizedArchieveData?.filter((item: any) =>
      targetKeys.includes(item.key)
    );
    setRightSideData(selectedData);
  }, [targetKeys, normalizedArchieveData]);

  const onChange: TableTransferProps["onChange"] = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  const handleTransferChange = (newTargetKeys: any) => {
    setTargetKeys(newTargetKeys);
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

  const columns: TableColumnsType<any> = [
    {
      dataIndex: "employee_name",
      title: "Nama",
    },
    {
      dataIndex: "is_active",
      title: "Status",
      render: (isActive: boolean) => (
        <Tag style={{ marginInlineEnd: 0 }} color={isActive ? "green" : "red"}>
          {isActive ? "AKTIF" : "TIDAK AKTIF"}
        </Tag>
      ),
    },
    {
      dataIndex: "tax_total",
      title: "Pajak",
      render: (price: number) => <span>{formatRupiah(price || 0)}</span>,
    },
    {
      title: "Aksi",
      key: "operation",
      width: "15%",
      render: (_: any, record: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: actionItems.map((item) => ({
                ...item,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  handleMenuClick(item, record);
                },
              })),
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<BsThreeDotsVertical />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
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
          idtype,
          nik,
          npwp,
          address,
          is_active,
          is_finance_admin,
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

    const { data: companyProfile, error: companyError } = await supabase
      .from("company_profile")
      .select("company_name, company_npwp, selected_npwp, selected_name")
      .eq("id", 1)
      .single();

    if (companyError) {
      message.error("Gagal mengambil data perusahaan");
      console.log("fetch company profile error:", companyError);
      return;
    }

    setCompanyProfile(companyProfile);
  };

  const fetchTer = async () => {
    const { data, error } = await supabase.from("ter").select(`*`);

    if (error) {
      console.error("Error fetching ter data:", error);
      return [];
    }

    setTer(data);
  };

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("tax_config")
      .select("*")
      .eq("id", 1)
      .single();
    setConfig({ ...data, loading: false });
  };

  useEffect(() => {
    fetchData();
    fetchTer();
    fetchConfig();
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
          is_active: emp?.is_active,
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
      if (item.key === Number(selectedRecord.key)) {
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

    setArchieveData(updatedData);
    setIsModalEditOpen(false);
    setSelectedRecord(null);
    message.success("Berhasil mengubah data");
  };

  const handleAddArchieve = async () => {
    if (!rightSideData.length || month === null || year === null) {
      message.warning(
        "Silakan pilih data dan pastikan periode sudah ditentukan"
      );
      return;
    }

    try {
      const financeEmployee = employees.find(
        (item: any) => item?.is_finance_admin === true
      );

      if (!financeEmployee) {
        message.error("Bagian keuangan tidak ditemukan");
        return;
      }

      if (!companyProfile) {
        message.error("Bagian keuangan tidak ditemukan");
        return;
      }

      let totalTax = 0;
      let totalTHP = 0;

      const archiveData = rightSideData
        .map((item) => {
          const employeeTax = taxes.find(
            (t: any) => t.idemployee === item.idemployee
          );
          if (!employeeTax) return null;

          let taxValue = 0;
          if (month === 1) {
            taxValue = employeeTax?.dectax || 0;
          } else {
            taxValue = employeeTax?.monthlytax || 0;
          }

          const thpValue = employeeTax?.thp || 0;
          totalTax += taxValue;
          totalTHP += thpValue;

          const emp = employees.find((e: any) => e.id === item.idemployee);

          return {
            year,
            month,
            idemployee: emp?.id,
            employee_name: emp?.name,
            type_id: emp?.idtype,
            nik: emp?.nik,
            npwp: emp?.npwp,
            address: emp?.address,
            ptkp: emp?.ptkp?.ptkp || null,
            position: emp?.positions?.position || null,
            position_allowance: emp?.positions?.incentive || 0,
            incentive: employeeTax?.incentive || 0,
            thp: thpValue,
            overtime_allowance: employeeTax?.overtime_allowance || 0,
            jkk: config.jkk_enabled ? employeeTax?.jkk || 0 : 0,
            jkm: config.jkm_enabled ? employeeTax?.jkm || 0 : 0,
            bpjs: config.bpjs_enabled ? employeeTax?.bpjs || 0 : 0,
            bonus: employeeTax?.bonus || 0,
            thr: employeeTax?.thr || 0,
            netto_salary: employeeTax?.nettosalary || 0,
            bruto_salary: employeeTax?.brutosalary || 0,
            tax_total: taxValue,
            type_id_finance: financeEmployee.idtype,
            npwp_finance: companyProfile.selected_npwp,
            nik_finance: financeEmployee.nik,
          };
        })
        .filter(Boolean);

      if (archiveData.length === 0) {
        message.error("Tidak ada data pajak yang valid untuk disimpan");
        return;
      }

      const { data: summaryInserted, error: summaryError } = await supabase
        .from("summary_monthly_tax")
        .insert({
          year,
          month,
          total_monthly_tax: totalTax,
          total_thp: totalTHP,
          total_employees: archiveData.length,
        })
        .select()
        .single();

      if (summaryError) throw summaryError;

      const archiveDataWithSummary = archiveData.map((item) => ({
        ...item,
        id_summary: summaryInserted.id,
      }));

      const { error: archiveError } = await supabase
        .from("monthly_tax_archive")
        .insert(archiveDataWithSummary);

      if (archiveError) throw archiveError;

      message.success(
        `Berhasil menyimpan ${archiveData.length} data pajak untuk masa ${month}/${year}`
      );

      setTargetKeys([]);
      setRightSideData([]);
    } catch (error) {
      console.error("Save error:", error);
      message.error("Gagal menyimpan data arsip pajak");
    }
  };

  return (
    <>
      <Flex align="start" gap="middle" vertical>
        <TableTransfer
          dataSource={normalizedArchieveData}
          targetKeys={targetKeys}
          onChange={handleTransferChange}
          leftColumns={columns}
          rightColumns={columns}
        />

        {/* <Space>
          <Statistic
            title="Total Selected Tax"
            value={formatRupiah(totalTax)}
          />
          <Statistic
            title="Total Selected THP"
            value={formatRupiah(totalTHP)}
          />
        </Space> */}

        <Button
          type="primary"
          disabled={!rightSideData?.length || !month || !year}
          onClick={handleAddArchieve}
          loading={false}
        >
          Simpan Arsip ({rightSideData?.length} items)
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
              {config.jkk_enabled
                ? formatRupiah(selectedRecord.jkk)
                : formatRupiah(0)}
            </Descriptions.Item>
            <Descriptions.Item label="JKM">
              {config.jkm_enabled
                ? formatRupiah(selectedRecord.jkm)
                : formatRupiah(0)}
            </Descriptions.Item>
            <Descriptions.Item label="BPJS">
              {config.bpjs_enabled
                ? formatRupiah(selectedRecord.bpjs)
                : formatRupiah(0)}
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
        destroyOnClose // This ensures the form is destroyed when closed
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

            <Form.Item name="thp" label="THP">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) =>
                  parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
                }
              />
            </Form.Item>

            <Form.Item name="incentive" label="Insentif">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) =>
                  parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
                }
              />{" "}
            </Form.Item>

            <Form.Item name="overtime_allowance" label="Overtime Allowance">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) =>
                  parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
                }
              />{" "}
            </Form.Item>

            <Form.Item name="bonus" label="Bonus">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) =>
                  parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
                }
              />{" "}
            </Form.Item>

            <Form.Item name="thr" label="THR">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) =>
                  parseInt(value?.replace(/Rp\s?|\./g, "") || "0", 10)
                }
              />{" "}
            </Form.Item>

            {/* <Form.Item name="tax_total" label="Pajak">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item> */}

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
