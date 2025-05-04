import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const today = new Date();
  const month = today.getMonth() + 1;

  if (month !== 1) {
    return res.status(400).json({
      message:
        "Saat ini bukan bulan Januari, tidak dapat memproses permintaan anda.",
    });
  }

  const { data: taxes, error: fetchTaxesError } = await supabase
    .from("tax")
    .select(`idemployee`);

  if (fetchTaxesError) {
    return res
      .status(500)
      .json({ message: "Gagal ambil data tax", error: fetchTaxesError });
  }

  if (!taxes || taxes.length === 0) {
    return res
      .status(200)
      .json({ message: "Tidak ada data tax untuk di-reset." });
  }

  const updatePromises = taxes.map((tax) =>
    supabase
      .from("tax")
      .update({ dectax: null })
      .eq("idemployee", tax.idemployee)
  );

  const results = await Promise.all(updatePromises);

  const failedUpdates = results.filter((res) => res.error);

  if (failedUpdates.length > 0) {
    return res.status(500).json({
      message: "Beberapa dectax gagal di-reset.",
      failedCount: failedUpdates.length,
    });
  }

  return res.status(200).json({ message: "Semua dectax berhasil di-reset." });
}
