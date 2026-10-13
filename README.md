# Resource Reservation Management System

A full-stack web application for managing shared resources and reservations. Users can view available resources, create reservations, prevent overlapping bookings, and cancel existing reservations.

## Features

- Dashboard with resource and reservation statistics
- Create and view shared resources
- Manage resource statuses: Available, Unavailable, and Maintenance
- Create reservations with user and resource details
- Prevent overlapping reservations for the same resource
- Cancel existing reservations
- Search and filter reservations
- PostgreSQL database for persistent storage
- Server-side validation and error handling

## Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js App Router API routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Tools:** Git, GitHub, VS Code

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   cd resource-reservation-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure your PostgreSQL connection:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/resource_reservation_db?schema=public"
   ```

   Replace `YOUR_PASSWORD` with your local PostgreSQL password.

4. Apply database migrations and generate the Prisma client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Database Design

The database contains three main entities:

- **User:** Stores the people who create reservations.
- **Resource:** Stores shared resources, their details, and availability status.
- **Reservation:** Stores reservation time ranges, status, purpose, and links to the user and resource.

Each reservation belongs to one user and one resource. A user or resource can have multiple reservations.

See the ER diagram in the project documentation.

## Business Rules

- A resource must exist and be available before a reservation can be created.
- The reservation end time must be later than the start time.
- Confirmed reservations for the same resource cannot overlap.
- Cancelled reservations do not block future bookings.
- Resource and reservation data are stored in PostgreSQL.

## Project Structure

```text
  app/
    api/
      dashboard/
      db-test/
      reservations/
      resources/
    reservations/
    resources/
    page.tsx
  lib/
    prisma.ts
prisma/
  schema.prisma
  migrations/
```

## Environment Variables

Do not commit your `.env` file or database credentials to GitHub. Configure environment variables locally.

## Author

Developed as a Software Engineering Internship Technical Assessment for PrimeWave Lab (Pvt) Ltd.
