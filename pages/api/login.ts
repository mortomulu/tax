import { supabase } from "@/utils/supabase";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from 'next/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  const { data: loginData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !loginData.user || !loginData.session) {
    return res.status(401).json({ message: "Email atau password salah!" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", loginData.user.id)
    .single();

  if (profileError || !profile?.role) {
    return res.status(500).json({ message: "Gagal mengambil data role" });
  }

  res.setHeader("Set-Cookie", [
    serialize("sb-access-token", loginData.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    }),
    serialize("sb-refresh-token", loginData.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    }),
    serialize("role", profile.role, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    }),
  ]);

  return res.status(200).json({ role: profile.role });
}
