
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardStats = {
  totalResources: number;
  availableResources: number;
  confirmedReservations: number;
  cancelledReservations: number;
};

const initialStats: DashboardStats = {
  totalResources: 0,
  availableResources: 0,
  confirmedReservations: 0,
  cancelledReservations: 0,
};

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Could not load dashboard statistics");
        }

        const data: DashboardStats = await response.json();
        setStats(data);
      } catch {
        setError("Unable to load statistics. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Total Resources",
      value: stats.totalResources,
      icon: "🏢",
    },
    {
      title: "Available Resources",
      value: stats.availableResources,
      icon: "✅",
    },
    {
      title: "Confirmed Reservations",
      value: stats.confirmedReservations,
      icon: "📅",
    },
    {
      title: "Cancelled Reservations",
      value: stats.cancelledReservations,
      icon: "❌",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-sm font-medium text-blue-600">
            RESOURCE MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Resource Reservation System
          </h1>

          <p className="mt-2 text-gray-600">
            Manage shared resources and reservations in one place.
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Dashboard Overview
          </h2>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <p className="text-2xl">{card.icon}</p>

                <p className="mt-3 text-sm text-gray-600">
                  {card.title}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : card.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/resources"
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-blue-100 p-3 text-2xl">
                🏢
              </span>

              <h2 className="text-xl font-semibold">
                Resource Management
              </h2>
            </div>

            <p className="mt-4 text-gray-600">
              Add resources, specify their locations and capacities,
              and view registered resources.
            </p>

            <p className="mt-5 font-medium text-blue-600">
              Manage Resources →
            </p>
          </Link>

          <Link
            href="/reservations"
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-green-100 p-3 text-2xl">
                📅
              </span>

              <h2 className="text-xl font-semibold">
                Reservations
              </h2>
            </div>

            <p className="mt-4 text-gray-600">
              Book resources, review reservation details, and cancel
              existing bookings.
            </p>

            <p className="mt-5 font-medium text-blue-600">
              Manage Reservations →
            </p>
          </Link>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Quick Start</h2>

          <ol className="mt-4 list-inside list-decimal space-y-3 text-gray-700">
            <li>Add a resource, such as a meeting room.</li>
            <li>Open Reservations and select that resource.</li>
            <li>Choose the reservation start and end times.</li>
            <li>Submit the booking and check the reservation list.</li>
          </ol>
        </section>

        <footer className="mt-10 border-t pt-5 text-sm text-gray-500">
          Resource Reservation Management System
        </footer>
      </div>
    </main>
  );
}
