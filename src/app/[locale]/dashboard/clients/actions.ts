'use server'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

// This file is now empty as all email-related functionality has been removed
// The clients page now only shows customer information without email campaigns
