import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (today.getDate() !== 23) {
    return res
      .status(400)
      .json({ message: "Hari ini bukan tanggal 20, tidak ada arsip." });
  }

  const { data: employees, error: fetchEmployeesError } = await supabase
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

  const archiveData = employees.map((emp: any) => {
    const employeeTax = taxes.find((t) => t.idemployee === emp.id);

    return {
      year,
      month,
      employee_name: emp.name,
      nik: emp.nik,
      ptkp: emp.ptkp?.ptkp || null,
      position: emp.positions?.position || null,
      position_allowance: emp.positions?.incentive || 0,
      incentive: employeeTax?.incentive || 0,
      thp: employeeTax?.thp || 0,
      overtime_allowance: employeeTax?.overtime_allowance || 0,
      jkk: employeeTax?.jkk || 0,
      jkm: employeeTax?.jkm || 0,
      bpjs: employeeTax?.bpjs || 0,
      bonus: employeeTax?.bonus || 0,
      thr: employeeTax?.thr || 0,
      netto_salary: employeeTax?.nettosalary || 0,
      bruto_salary: employeeTax?.brutosalary || 0,
      tax_total: employeeTax?.monthlytax || 0,
    };
  });

  const { error: insertError } = await supabase
    .from("monthly_tax_archive")
    .insert(archiveData);

  if (insertError) {
    return res
      .status(500)
      .json({ message: "Gagal simpan arsip tax", error: insertError });
  }

  res.status(200).json({ message: "Berhasil arsip tax ke database!" });
}
