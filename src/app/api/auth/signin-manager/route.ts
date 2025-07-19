import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "changeme-super-secret-key"
const COOKIE_NAME = "manager_token"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 })
    }
    // Find manager by email
    const user = await prisma.usermanager.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }
    // Check password (field is 'password')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }
    // Create JWT (use user_id)
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: "manager" },
      JWT_SECRET,
      { expiresIn: "7d" }
    )
    // Set cookie
    const res = NextResponse.json({ message: "Login successful" })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return res
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
