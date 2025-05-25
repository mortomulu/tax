import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const options = {
    path: "/",
    httpOnly: true,
    sameSite: "strict" as const,
    // secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  };

  res.setHeader("Set-Cookie", [
    serialize("sb-access-token", "", options),
    serialize("sb-refresh-token", "", options),
    serialize("role", "", options),
  ]);

  res.status(200).json({ message: "Logout berhasil" });
}
