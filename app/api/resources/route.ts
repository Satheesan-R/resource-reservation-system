import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return NextResponse.json(
      { message: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : null;

    const capacity = body.capacity;

    if (!name) {
      return NextResponse.json(
        { message: "Resource name is required" },
        { status: 400 }
      );
    }

    if (
      capacity !== undefined &&
      capacity !== null &&
      capacity !== "" &&
      (!Number.isInteger(Number(capacity)) ||
        Number(capacity) < 1)
    ) {
      return NextResponse.json(
        { message: "Capacity must be a positive whole number" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        description: description || null,
        location: location || null,
        capacity:
          capacity === undefined ||
          capacity === null ||
          capacity === ""
            ? null
            : Number(capacity),
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Failed to create resource:", error);

    return NextResponse.json(
      { message: "Failed to create resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = body.status;
    const validStatuses = [
      "AVAILABLE",
      "UNAVAILABLE",
      "MAINTENANCE",
    ];

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { message: "A valid resource ID is required" },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !validStatuses.includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid resource status" },
        { status: 400 }
      );
    }

    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        status: status as
          | "AVAILABLE"
          | "UNAVAILABLE"
          | "MAINTENANCE",
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Failed to update resource:", error);

    return NextResponse.json(
      { message: "Failed to update resource" },
      { status: 500 }
    );
  }
}
