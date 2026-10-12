
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [users, resources, reservations] =
      await Promise.all([
        prisma.user.count(),
        prisma.resource.count(),
        prisma.reservation.count(),
      ]);

    return NextResponse.json({
      message: "Database connection successful!",
      tables: {
        users,
        resources,
        reservations,
      },
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }
}
