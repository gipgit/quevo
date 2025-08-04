import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processAndSaveImage } from "@/lib/imageUpload";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { business_id: string } }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const business_id = params.business_id;
  // Check ownership
  const business = await prisma.business.findUnique({
    where: { business_id: business_id },
  });
  if (!business || business.manager_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const profileImg = formData.get("profile_image") as File | null;
  const coverImg = formData.get("cover_image") as File | null;

  let profileImgPath = null;
  let coverImgPath = null;

  // Profile image
  if (profileImg) {
    const arrayBuffer = await profileImg.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await processAndSaveImage({
      buffer,
      filename: "profile.webp",
      width: 400,
      height: 400,
      quality: 80,
      fit: "cover",
      maxSizeBytes: 1024 * 1024, // 1MB
      businessId: business_id,
      uploadType: "business",
    });
    profileImgPath = result.publicPath || result.path;
  }
  // Cover image
  if (coverImg) {
    const arrayBuffer = await coverImg.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await processAndSaveImage({
      buffer,
      filename: "cover.webp",
      width: 1200,
      height: 400,
      quality: 80,
      fit: "cover",
      maxSizeBytes: 2 * 1024 * 1024, // 2MB
      businessId: business_id,
      uploadType: "business",
    });
    coverImgPath = result.publicPath || result.path;
  }

  // Update business record
  await prisma.business.update({
    where: { business_id: business_id },
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
