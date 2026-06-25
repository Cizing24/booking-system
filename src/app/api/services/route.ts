import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const formattedServices = services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: Number(service.price.toString()),
      isActive: service.isActive,
    }));

    return NextResponse.json(successResponse(formattedServices));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      errorResponse("無法取得服務列表，請稍後再試。"),
      { status: 500 },
    );
  }
}