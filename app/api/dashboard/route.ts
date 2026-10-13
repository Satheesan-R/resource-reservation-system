
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalResources,
      availableResources,
      confirmedReservations,
      cancelledReservations,
    ] = await Promise.all([
      prisma.resource.count(),
      prisma.resource.count({
        where: { status: "AVAILABLE" },
      }),
      prisma.reservation.count({
        where: { status: "CONFIRMED" },
      }),
      prisma.reservation.count({
        where: { status: "CANCELLED" },
      }),
    ]);

    return NextResponse.json({
      totalResources,
      availableResources,
      confirmedReservations,
      cancelledReservations,
    });
  } catch (error) {
    console.error("Failed to load dashboard statistics:", error);

    return NextResponse.json(
      { message: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
