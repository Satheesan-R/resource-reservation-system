
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true,
        resource: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);

    return NextResponse.json(
      { message: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const resourceId = Number(body.resourceId);
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    const purpose =
      typeof body.purpose === "string"
        ? body.purpose.trim()
        : "";

    if (!name || !email || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { message: "Name, email, start time and end time are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(resourceId) || resourceId < 1) {
      return NextResponse.json(
        { message: "Please select a valid resource" },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      endTime <= startTime
    ) {
      return NextResponse.json(
        { message: "End time must be later than start time" },
        { status: 400 }
      );
    }

    const reservation = await prisma.$transaction(
      async (tx) => {
        const resource = await tx.resource.findUnique({
          where: { id: resourceId },
        });

        if (!resource) {
          throw new Error("RESOURCE_NOT_FOUND");
        }

        if (resource.status !== "AVAILABLE") {
          throw new Error("RESOURCE_UNAVAILABLE");
        }

        // Find a confirmed reservation that overlaps this time.
        const overlapping = await tx.reservation.findFirst({
          where: {
            resourceId,
            status: "CONFIRMED",
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        });

        if (overlapping) {
          throw new Error("RESERVATION_CONFLICT");
        }

        // Reuse an existing user with this email.
        // Otherwise, create a new user.
        const user = await tx.user.upsert({
          where: { email },
          update: { name },
          create: { name, email },
        });

        return tx.reservation.create({
          data: {
            userId: user.id,
            resourceId,
            startTime,
            endTime,
            purpose: purpose || null,
          },
          include: {
            user: true,
            resource: true,
          },
        });
      },
      {
        isolationLevel: "Serializable",
      }
    );

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "RESOURCE_NOT_FOUND") {
        return NextResponse.json(
          { message: "Resource not found" },
          { status: 404 }
        );
      }

      if (error.message === "RESOURCE_UNAVAILABLE") {
        return NextResponse.json(
          { message: "This resource is not available for booking" },
          { status: 409 }
        );
      }

      if (error.message === "RESERVATION_CONFLICT") {
        return NextResponse.json(
          { message: "This resource is already reserved for that time" },
          { status: 409 }
        );
      }

      // PostgreSQL may reject one of two simultaneous transactions
      // when both try to reserve the same time.
      if ("code" in error && error.code === "P2034") {
        return NextResponse.json(
          { message: "A booking conflict occurred. Please try again." },
          { status: 409 }
        );
      }
    }

    console.error("Failed to create reservation:", error);

    return NextResponse.json(
      { message: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { message: "A valid reservation ID is required" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { message: "This reservation is already cancelled" },
        { status: 409 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        user: true,
        resource: true,
      },
    });

    return NextResponse.json({
      message: "Reservation cancelled successfully",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("Failed to cancel reservation:", error);

    return NextResponse.json(
      { message: "Failed to cancel reservation" },
      { status: 500 }
    );
  }
}
