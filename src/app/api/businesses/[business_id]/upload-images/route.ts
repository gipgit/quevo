import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processAndSaveImage } from "@/lib/imageUpload";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const businessId = params.businessId;
  // Check ownership
  const business = await prisma.business.findUnique({
    where: { business_id: businessId },
  });
  if (!business || business.manager_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const profileImg = formData.get("profile_image") as File | null;
  const coverImg = formData.get("cover_image") as File | null;

  let profileImgPath = null;
  let coverImgPath = null;

  // Get business_public_uuid for correct upload path
  const businessPublicUuid = business.business_public_uuid;
  if (!businessPublicUuid) {
    return NextResponse.json({ error: "Business public UUID not set" }, { status: 400 });
  }

  // Directory to save images (e.g. public/uploads/business/{business_public_uuid}/)
  const saveDir = path.join(process.cwd(), "public", "uploads", "business", businessPublicUuid);
  await fs.mkdir(saveDir, { recursive: true });

  // Profile image
  if (profileImg) {
    const arrayBuffer = await profileImg.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await processAndSaveImage({
      buffer,
      uploadDir: saveDir,
      filename: "profile.webp",
      width: 400,
      height: 400,
      quality: 80,
      fit: "cover",
      maxSizeBytes: 1024 * 1024, // 1MB
    });
    profileImgPath = `/uploads/business/${businessPublicUuid}/profile.webp`;
  }
  // Cover image
  if (coverImg) {
    const arrayBuffer = await coverImg.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await processAndSaveImage({
      buffer,
      uploadDir: saveDir,
      filename: "cover.webp",
      width: 1200,
      height: 400,
      quality: 80,
      fit: "cover",
      maxSizeBytes: 2 * 1024 * 1024, // 2MB
    });
    coverImgPath = `/uploads/business/${businessPublicUuid}/cover.webp`;
  }

  // Update business record
  await prisma.business.update({
    where: { business_id: businessId },
    data: {
      ...(profileImgPath && { business_img_profile: profileImgPath }),
      ...(coverImgPath && { business_img_cover: coverImgPath }),
    },
  });

  return NextResponse.json({
    profileImgPath,
    coverImgPath,
  });
}
