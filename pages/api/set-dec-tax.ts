import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";
import { calcDecTax, calcDecTaxFinal } from "@/helpers/decTaxCalc";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (month !== 12) {
    return res.status(400).json({
      message:
        "Saat ini bukan bulan Desember, tidak dapat memproses permintaan anda.",
    });
  }

  const { data: ptkp, error: fetchPtkpError } = await supabase
    .from("ptkp")
    .select("ptkp, amount");

  if (fetchPtkpError) {
    return res
      .status(500)
      .json({ message: "Gagal ambil data PTKP", error: fetchPtkpError });
  }

  const { data: taxes, error: fetchTaxesError } = await supabase.from("tax")
    .select(`
      id,
      idemployee,
      brutosalary,
      employees (
        ptkp (ptkp)
      )
    `);

  if (fetchTaxesError) {
    return res
      .status(500)
      .json({ message: "Gagal ambil data tax", error: fetchTaxesError });
  }

  const { data: monthlyTaxes, error: fetchMonthlyTaxesError } = await supabase
    .from("monthly_tax_archive")
    .select("idemployee, month, tax_total, bruto_salary")
    .eq("year", year)
    .lt("month", 12);

  if (fetchMonthlyTaxesError) {
    return res.status(500).json({
      message: "Gagal ambil data monthly tax",
      error: fetchMonthlyTaxesError,
    });
  }

  const failedUpdates: number[] = [];
  const successUpdates: number[] = [];

  await Promise.all(
    taxes.map(async (tax : any) => {
      const employeeId = tax.idemployee;

      const monthlyData = monthlyTaxes.filter(
        (item) => item.idemployee === employeeId
      );

      const totalTax11 = monthlyData.reduce(
        (sum, item) => sum + (item.tax_total || 0),
        0
      );
      const totalBruto11 = monthlyData.reduce(
        (sum, item) => sum + (item.bruto_salary || 0),
        0
      );

      const yearlyBruto = totalBruto11 + (tax.brutosalary || 0);

      const employeePTKP = tax.employees?.ptkp?.ptkp
      const ptkpEmployee = ptkp.find((item) => item.ptkp === employeePTKP);

      if (!ptkpEmployee) {
        console.warn(`PTKP tidak ditemukan untuk ID ${employeeId}`);
        failedUpdates.push(employeeId);
        return;
      }

      const totalTaxable = calcDecTax(yearlyBruto, ptkpEmployee.amount);
      const yearlyPPh = calcDecTaxFinal(totalTaxable);
      const decTax = Math.max(yearlyPPh - totalTax11, 0);

      const { error: updateError } = await supabase
        .from("tax")
        .update({ dectax: decTax })
        .eq("idemployee", employeeId);

      if (updateError) {
        console.error(
          `Gagal update dectax untuk ID ${employeeId}`,
          updateError
        );
        failedUpdates.push(employeeId);
      } else {
        successUpdates.push(employeeId);
      }
    })
  );

  return res.status(200).json({
    message: "Proses update dectax selesai.",
    totalUpdated: successUpdates.length,
    totalFailed: failedUpdates.length,
    failedEmployees: failedUpdates,
  });
}
