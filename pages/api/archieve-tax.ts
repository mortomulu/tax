import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (today.getDate() !== 1) {
    return res
      .status(400)
      .json({ message: "Hari ini bukan tanggal 1, tidak ada arsip." });
  }

  const { data: employees, error: fetchEmployeesError } = await supabase.from(
    "employees"
  ).select(`
      id,
      name,
      idtype,
      nik,
      npwp,
      address,
      ptkp:ptkp (ptkp),
      positions:idposition (position, incentive)
    `);

  if (fetchEmployeesError) {
    return res.status(500).json({
      message: "Gagal ambil data karyawan",
      error: fetchEmployeesError,
    });
  }

  const { data: taxes, error: fetchTaxesError } = await supabase
    .from("tax")
    .select("*");

  if (fetchTaxesError) {
    return res
      .status(500)
      .json({ message: "Gagal ambil tax data", error: fetchTaxesError });
  }

  let totalTax = 0;
  let totalTHP = 0;

  const financeEmployee = employees.filter(
    (item: any) => item.positions.position == "MAN, KEU"
  );

  const archiveData = employees
    .map((emp: any) => {
      const employeeTax = taxes.find((t) => t.idemployee === emp.id);
      if (!employeeTax) return null;

      let taxValue = 0;

      if (month == 1) {
        taxValue = employeeTax?.dectax || 0;
      } else {
        taxValue = employeeTax?.monthlytax || 0;
      }

      const thpValue = employeeTax?.thp || 0;

      totalTax += taxValue;
      totalTHP += thpValue;

      return {
        year,
        month,
        idemployee: emp.id,
        employee_name: emp.name,
        type_id: emp.idtype,
        nik: emp.nik,
        npwp: emp.npwp,
        address: emp.address,
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
        type_id_finance: financeEmployee[0].idtype,
        npwp_finance: financeEmployee[0].npwp,
        nik_finance: financeEmployee[0].nik,
      };
    })
    .filter(Boolean);

  if (archiveData.length === 0) {
    return res
      .status(400)
      .json({ message: "Tidak ada data pajak yang dapat diarsipkan." });
  }

  const { data: summaryInserted, error: insertSummaryError } = await supabase
    .from("summary_monthly_tax")
    .insert([
      {
        year,
        month,
        total_monthly_tax: totalTax,
        total_thp: totalTHP,
        total_employees: archiveData.length,
      },
    ])
    .select()
    .single();

  if (insertSummaryError) {
    return res.status(500).json({
      message: "Gagal simpan summary monthly tax",
      error: insertSummaryError,
    });
  }

  const archiveDataWithSummary = archiveData.map((item) => ({
    ...item,
    id_summary: summaryInserted.id,
  }));

  const { error: insertError } = await supabase
    .from("monthly_tax_archive")
    .insert(archiveDataWithSummary);

  if (insertError) {
    return res
      .status(500)
      .json({ message: "Gagal simpan arsip tax", error: insertError });
  }

  res.status(200).json({
    message: "Berhasil arsipkan tax dan simpan summary bulanan!",
    summaryId: summaryInserted.id,
  });
}
