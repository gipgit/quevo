import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { sendMail } from "@/lib/nodemailer"

// Validation schema
const signupSchema = z.object({
  name_first: z
    .string()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(50, "Il nome non può superare i 50 caratteri")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Il nome contiene caratteri non validi"),
  email: z
    .string()
    .email("Formato email non valido")
    .toLowerCase()
    .transform((email) => email.trim()),
  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .regex(/(?=.*[a-z])/, "La password deve contenere almeno una lettera minuscola")
    .regex(/(?=.*[A-Z])/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/(?=.*\d)/, "La password deve contenere almeno un numero")
    .regex(/(?=.*[@$!%*?&])/, "La password deve contenere almeno un carattere speciale")
})

export async function POST(request: Request) {
  console.log("[signup-manager] POST request received")
  console.log("[signup-manager] Request URL:", request.url)
  console.log("[signup-manager] Request headers:", Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.json()
    console.log("[signup-manager] Request body received:", { 
      name_first: body.name_first ? "***" : "undefined",
      email: body.email ? "***" : "undefined",
      hasPassword: !!body.password,
      promotional_code: body.promotional_code ? "***" : "undefined"
    })
    
    const validatedData = signupSchema.parse(body)
    console.log("[signup-manager] Data validated successfully")

    // Get locale from request headers
    const acceptLanguage = request.headers.get("Accept-Language")
    const requestLocale = acceptLanguage?.split(",")[0].split("-")[0] || "it"
    
    // Validate locale is supported
    const supportedLocales = ["it", "en", "es"]
    const finalLocale = supportedLocales.includes(requestLocale) ? requestLocale : "it"
    
    console.log(`[signup-manager] Request locale: ${requestLocale}, Final locale: ${finalLocale}`)

    // Use AUTH_URL or fallback to NEXTAUTH_URL, or construct from request
    let authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL
    
    // If neither is set, try to construct from the request
    if (!authUrl) {
      const url = new URL(request.url)
      authUrl = `${url.protocol}//${url.host}`
      console.log(`[signup-manager] Constructed AUTH_URL from request: ${authUrl}`)
    }

    if (!authUrl) {
      console.error("Environment variables AUTH_URL and NEXTAUTH_URL are not defined. Cannot generate activation link.")
      return NextResponse.json({ message: "Errore di configurazione del server." }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
        }
      })
    }

    console.log("[signup-manager] Environment check:", {
      hasAuthUrl: !!process.env.AUTH_URL,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      hasEmailFrom: !!process.env.EMAIL_FROM,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    })

    // Check if user already exists in Prisma usermanager table
    const existingManagerProfile = await prisma.usermanager.findUnique({
      where: { email: validatedData.email },
    })

    if (existingManagerProfile) {
      console.log("[signup-manager] User already exists:", validatedData.email)
      return NextResponse.json({ message: "Un account manager per questa email esiste già." }, { 
        status: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
        }
      })
    }

    console.log("[signup-manager] User does not exist, proceeding with creation")

    // Hash password and generate activation token
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    const activationToken = uuidv4()

    // Create manager profile in transaction
    let newManagerProfile
    try {
      newManagerProfile = await prisma.usermanager.create({
        data: {
          name_first: validatedData.name_first,
          name_last: "",
          email: validatedData.email,
          password: hashedPassword,
          birth_date: null,
          birth_country: null,
          gender: null,
          residence_country: null,
          residence_region: null,
          residence_city: null,
          residence_address: null,
          tel: null,
          active: "inactive",
          verification_status: "waiting",
          token_activation: activationToken,
          date_created: new Date(),
        },
      })
      console.log("[signup-manager] User created successfully:", newManagerProfile.user_id)
    } catch (dbError) {
      console.error("Database transaction error:", dbError)
      return NextResponse.json({ message: "Errore durante la creazione del profilo manager." }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
        }
      })
    }

    // Generate activation link with locale
    const activationLink = `${authUrl}/${finalLocale}/signup/business/activation?token=${activationToken}&email=${encodeURIComponent(validatedData.email)}`

    // Send activation email
    try {
      console.log("[signup-manager] Attempting to send activation email")
      await sendMail({
        to: validatedData.email,
        template: "UserManagerActivation",
        templateProps: {
          recipientName: validatedData.name_first,
          confirmationLink: activationLink,
        },
        locale: finalLocale,
      })
      console.log("[signup-manager] Activation email sent successfully")
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Clean up user if email fails
      try {
        await prisma.usermanager.delete({
          where: { email: validatedData.email },
        })
        console.log("Cleaned up user record after email error")
      } catch (cleanupError) {
        console.error("Error cleaning up after email error:", cleanupError)
      }
      return NextResponse.json(
        {
          message: "Errore durante l'invio dell'email di attivazione. Riprova più tardi.",
        },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
          }
        },
      )
    }

    // Log success for debugging
    console.log("--- Manager Signup Success ---")
    console.log(`Email: ${validatedData.email}`)
    console.log(`Activation Link: ${activationLink}`)
    console.log(`Locale: ${finalLocale}`)
    console.log("-----------------------------")

    return NextResponse.json(
      {
        message: "Registrazione completata! Controlla la tua email per attivare l'account.",
        success: true,
      },
      { 
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
        }
      },
    )
  } catch (error) {
    console.error("Manager Signup Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dati non validi",
          errors: error.flatten().fieldErrors,
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
          }
        },
      )
    }

    return NextResponse.json({ message: "Errore interno del server. Riprova più tardi." }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
      }
    })
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
    },
  })
}
