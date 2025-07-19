import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" })
  res.cookies.set("customer_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
