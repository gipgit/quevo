import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { mkdir } from "fs/promises"
import { join } from "path"
import { processAndSaveImage } from "@/lib/imageUpload"
import { parseContacts, hasValidContacts, isValidEmail, isValidPhone } from "@/lib/utils/contacts"

const createBusinessSchema = z.object({
  business_name: z.string().min(2).max(50),
  business_country: z.string().min(2).max(50),
  business_region: z.string().optional(),
  business_address: z.string().optional(),
  business_urlname: z.string().min(3).max(30),
  business_phone: z.string().optional(),
  business_email: z.string().optional(),
  selected_links: z.array(z.string()).optional(),
  link_urls: z.record(z.string()).optional(),
  settings: z.object({
    default_page: z.string().default("bookings"),
    theme_color_background: z.string().default("#FFFFFF"),
    theme_color_text: z.string().default("#000000"),
    theme_color_button: z.string().default("#000000"),
    theme_font: z.string().default("1"),
    show_address: z.boolean().default(true),
    show_website: z.boolean().default(true),
    show_socials: z.boolean().default(true),
    show_btn_booking: z.boolean().default(true),
    show_btn_payments: z.boolean().default(true),
    show_btn_review: z.boolean().default(true),
    show_btn_phone: z.boolean().default(true),
    show_btn_email: z.boolean().default(true),
    show_btn_order: z.boolean().default(false),
  }),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    console.log("Session:", session)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    // Verify user exists in database
    const user = await prisma.usermanager.findUnique({
      where: { user_id: session.user.id },
      select: { user_id: true, name_first: true, name_last: true }
    })

    if (!user) {
      return NextResponse.json({ message: "Utente non trovato" }, { status: 404 })
    }

    const formData = await request.formData()

    // Debug: Log form data
    console.log("Form data received:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    // Parse form data
    const businessData = {
      business_name: formData.get("business_name") as string,
      business_country: formData.get("business_country") as string,
      business_region: formData.get("business_region") as string,
      business_address: formData.get("business_address") as string,
      business_urlname: formData.get("business_urlname") as string,
      business_phone: formData.get("business_phone") as string,
      business_email: formData.get("business_email") as string,
      selected_links: JSON.parse((formData.get("selected_links") as string) || "[]"),
      link_urls: JSON.parse((formData.get("link_urls") as string) || "{}"),
      settings: JSON.parse(formData.get("settings") as string),
    }

    const validatedData = createBusinessSchema.parse(businessData)

    // Additional validation for required fields
    if (!validatedData.business_name || validatedData.business_name.trim() === '') {
      return NextResponse.json({ message: "Nome business richiesto" }, { status: 400 })
    }

    if (!validatedData.business_country || validatedData.business_country.trim() === '') {
      return NextResponse.json({ message: "Paese business richiesto" }, { status: 400 })
    }

    if (!validatedData.business_urlname || validatedData.business_urlname.trim() === '') {
      return NextResponse.json({ message: "Nome URL business richiesto" }, { status: 400 })
    }

    // Check length constraints
    if (validatedData.business_name.length > 50) {
      return NextResponse.json({ message: "Nome business troppo lungo (max 50 caratteri)" }, { status: 400 })
    }

    if (validatedData.business_urlname.length > 30) {
      return NextResponse.json({ message: "Nome URL business troppo lungo (max 30 caratteri)" }, { status: 400 })
    }

    if (validatedData.business_country.length > 50) {
      return NextResponse.json({ message: "Nome paese troppo lungo (max 50 caratteri)" }, { status: 400 })
    }

    if (validatedData.business_region && validatedData.business_region.length > 50) {
      return NextResponse.json({ message: "Nome regione troppo lungo (max 50 caratteri)" }, { status: 400 })
    }

    if (validatedData.business_address && validatedData.business_address.length > 80) {
      return NextResponse.json({ message: "Indirizzo troppo lungo (max 80 caratteri)" }, { status: 400 })
    }

    // Validate JSON structure for phone and email
    let phoneData: any[] | undefined = undefined
    let emailData: any[] | undefined = undefined

    if (validatedData.business_phone && validatedData.business_phone !== '[]') {
      try {
        const phones = parseContacts(validatedData.business_phone)
        if (phones.length > 0) {
          // Validate each phone entry
          for (const phone of phones) {
            if (!phone.value || phone.value.trim() === '') {
              return NextResponse.json({ message: "Numero di telefono richiesto" }, { status: 400 })
            }
            if (!isValidPhone(phone.value)) {
              return NextResponse.json({ message: "Formato telefono non valido" }, { status: 400 })
            }
          }
          phoneData = phones
        }
      } catch (e) {
        console.error("Phone parsing error:", e)
        return NextResponse.json({ message: "Formato telefono non valido" }, { status: 400 })
      }
    }

    if (validatedData.business_email && validatedData.business_email !== '[]') {
      try {
        const emails = parseContacts(validatedData.business_email)
        if (emails.length > 0) {
          // Validate each email entry
          for (const email of emails) {
            if (!email.value || email.value.trim() === '') {
              return NextResponse.json({ message: "Indirizzo email richiesto" }, { status: 400 })
            }
            if (!isValidEmail(email.value)) {
              return NextResponse.json({ message: "Formato email non valido" }, { status: 400 })
            }
          }
          emailData = emails
        }
      } catch (e) {
        console.error("Email parsing error:", e)
        return NextResponse.json({ message: "Formato email non valido" }, { status: 400 })
      }
    }

    // Validate business URL name format
    const urlNameRegex = /^[a-zA-Z0-9-]+$/
    if (!urlNameRegex.test(validatedData.business_urlname)) {
      return NextResponse.json({ 
        message: "Il nome URL può contenere solo lettere, numeri e trattini" 
      }, { status: 400 })
    }

    // Check if business URL name is already taken
    const existingBusiness = await prisma.business.findUnique({
      where: { business_urlname: validatedData.business_urlname },
    })

    if (existingBusiness) {
      return NextResponse.json({ message: "Nome URL business già in uso" }, { status: 409 })
    }

    // Generate business UUID
    const businessPublicUuid = crypto.randomUUID()

    // Handle image uploads
    let profileImagePath = null
    let coverImagePath = null

    const profileImage = formData.get("profile_image") as File
    const coverImage = formData.get("cover_image") as File

    // Use a business-specific directory for images
    const businessDir = join(process.cwd(), "public", "uploads", "business", businessPublicUuid)
    try {
      await mkdir(businessDir, { recursive: true })
    } catch (dirError) {
      console.error("Error creating directory:", dirError)
      // Continue without images if directory creation fails
    }

    if (profileImage && profileImage.size > 0) {
      try {
        const bytes = await profileImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await processAndSaveImage({
          buffer,
          uploadDir: businessDir,
          filename: "profile.webp",
          width: 400,
          height: 400,
          quality: 80,
          fit: "cover",
          maxSizeBytes: 1024 * 1024,
        })
        profileImagePath = result.publicPath
      } catch (imageError) {
        console.error("Error processing profile image:", imageError)
        // Continue without profile image
      }
    }

    if (coverImage && coverImage.size > 0) {
      try {
        const bytes = await coverImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await processAndSaveImage({
          buffer,
          uploadDir: businessDir,
          filename: "cover.webp",
          width: 1200,
          height: 400,
          quality: 80,
          fit: "cover",
          maxSizeBytes: 2 * 1024 * 1024,
        })
        coverImagePath = result.publicPath
      } catch (imageError) {
        console.error("Error processing cover image:", imageError)
        // Continue without cover image
      }
    }

    // Create the business with transaction
    let result
    try {
      result = await prisma.$transaction(async (tx) => {
        // Create the business
        const business = await tx.business.create({
          data: {
            business_name: validatedData.business_name,
            business_urlname: validatedData.business_urlname,
            business_country: validatedData.business_country,
            business_region: validatedData.business_region || "N/A",
            business_city: "N/A", // You might want to add this to the form
            business_address: validatedData.business_address || "N/A",
            business_phone: phoneData,
            business_email: emailData,
            business_descr: null,
            company_name: validatedData.business_name, // Using business name as company name for now
            company_country: validatedData.business_country,
            company_region: validatedData.business_region || "N/A",
            company_city: "N/A", // You might want to add this to the form
            company_address: validatedData.business_address || "N/A",
            company_vat: "N/A", // You might want to add this to the form
            company_contact: `${user.name_first} ${user.name_last}`.trim() || "N/A",
            manager_id: session.user.id,
            business_public_uuid: businessPublicUuid,
            business_img_profile: profileImagePath,
            business_img_cover: coverImagePath,
          },
        })

        // Create business profile settings
        await tx.businessprofilesettings.create({
          data: {
            business_id: business.business_id,
            default_page: validatedData.settings.default_page || "bookings",
            theme_color_background: validatedData.settings.theme_color_background || "#FFFFFF",
            theme_color_text: validatedData.settings.theme_color_text || "#000000",
            theme_color_button: validatedData.settings.theme_color_button || "#000000",
            theme_font: validatedData.settings.theme_font || "1",
            show_address: validatedData.settings.show_address ?? true,
            show_website: validatedData.settings.show_website ?? true,
            show_socials: validatedData.settings.show_socials ?? true,
            show_btn_booking: validatedData.settings.show_btn_booking ?? true,
            show_btn_payments: validatedData.settings.show_btn_payments ?? true,
            show_btn_review: validatedData.settings.show_btn_review ?? true,
            show_btn_phone: validatedData.settings.show_btn_phone ?? true,
            show_btn_email: validatedData.settings.show_btn_email ?? true,
            show_btn_order: validatedData.settings.show_btn_order ?? false,
          },
        })

        // Create business links
        if (validatedData.selected_links && validatedData.selected_links.length > 0) {
          const linkData = validatedData.selected_links
            .filter((linkType) => validatedData.link_urls?.[linkType])
            .map((linkType) => {
              const url = validatedData.link_urls![linkType]
              // Basic URL validation
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return null
              }
              return {
                business_id: business.business_id,
                link_type: linkType,
                link_url: url,
              }
            })
            .filter((item): item is { business_id: string; link_type: string; link_url: string } => item !== null)

          if (linkData.length > 0) {
            await tx.businesslink.createMany({
              data: linkData,
            })
          }
        }

        return business
      })
    } catch (dbError) {
      console.error("Database transaction error:", dbError)
      console.error("Database error details:", {
        message: dbError instanceof Error ? dbError.message : "Unknown error",
        stack: dbError instanceof Error ? dbError.stack : "No stack trace",
        name: dbError instanceof Error ? dbError.name : "Unknown error type"
      })
      
      if (dbError instanceof Error && dbError.message.includes('unique constraint')) {
        return NextResponse.json({ message: "Nome URL business già in uso" }, { status: 409 })
      }
      
      if (dbError instanceof Error && dbError.message.includes('foreign key constraint')) {
        return NextResponse.json({ message: "Errore di riferimento: utente non trovato" }, { status: 400 })
      }
      
      throw dbError
    }

    return NextResponse.json(
      {
        message: "Business creato con successo",
        business: {
          business_id: result.business_id,
          business_name: result.business_name,
          business_urlname: result.business_urlname,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.flatten().fieldErrors)
      return NextResponse.json(
        {
          message: "Dati non validi",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    console.error("Error creating business:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 })
  }
}
