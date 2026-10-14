
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl shadow-slate-200 sm:px-10 sm:py-12">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-300">
            RESOURCE MANAGEMENT
            </p>

            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Resource Reservation System
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage shared resources and reservations in one place with a
              clear, reliable workspace for your team.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                At a glance
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Dashboard Overview
              </h2>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-blue-50 p-3 text-2xl">
                    {card.icon}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    LIVE
                  </span>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {loading ? "..." : card.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/resources"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-blue-50 p-3 text-2xl">
                🏢
              </span>

              <h2 className="text-xl font-bold">
                Resource Management
              </h2>
            </div>

            <p className="mt-4 leading-6 text-slate-600">
              Add resources, specify their locations and capacities,
              and view registered resources.
            </p>

            <p className="mt-5 font-semibold text-blue-600 transition group-hover:text-blue-700">
              Manage Resources →
            </p>
          </Link>

          <Link
            href="/reservations"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-emerald-50 p-3 text-2xl">
                📅
              </span>

              <h2 className="text-xl font-bold">
                Reservations
              </h2>
            </div>

            <p className="mt-4 leading-6 text-slate-600">
              Book resources, review reservation details, and cancel
              existing bookings.
            </p>

            <p className="mt-5 font-semibold text-emerald-600 transition group-hover:text-emerald-700">
              Manage Reservations →
            </p>
          </Link>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Getting started
          </p>
          <h2 className="mt-1 text-xl font-bold">Quick Start</h2>

          <ol className="mt-5 grid gap-4 text-sm leading-6 text-slate-600 sm:grid-cols-2">
            <li>Add a resource, such as a meeting room.</li>
            <li>Open Reservations and select that resource.</li>
            <li>Choose the reservation start and end times.</li>
            <li>Submit the booking and check the reservation list.</li>
          </ol>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-500">
          Resource Reservation Management System
        </footer>
      </div>
    </main>
  );
}
