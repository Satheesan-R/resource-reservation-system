
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Resource = {
  id: number;
  name: string;
  location: string | null;
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
};

type Reservation = {
  id: number;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
  purpose: string | null;
  user: {
    name: string;
    email: string;
  };
  resource: {
    name: string;
    location: string | null;
  };
};

export default function ReservationsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");


  async function loadData() {
    try {
      const [resourceResponse, reservationResponse] =
        await Promise.all([
          fetch("/api/resources"),
          fetch("/api/reservations"),
        ]);

      if (!resourceResponse.ok || !reservationResponse.ok) {
        throw new Error("Failed to load booking information");
      }

      const resourceData: Resource[] =
        await resourceResponse.json();

      const reservationData: Reservation[] =
        await reservationResponse.json();

      setResources(resourceData);
      setReservations(reservationData);
    } catch {
      setMessage("Could not load data. Please refresh the page.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const load = async () => {
      await loadData();
    };

    void load();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (new Date(endTime) <= new Date(startTime)) {
      setMessage("End time must be later than start time.");
      setIsError(true);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          resourceId: Number(resourceId),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setMessage("Reservation created successfully!");
      setIsError(false);

      setName("");
      setEmail("");
      setResourceId("");
      setStartTime("");
      setEndTime("");
      setPurpose("");

      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
      setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch("/api/reservations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cancellation failed");
      }

      setMessage("Reservation cancelled successfully!");
      setIsError(false);

      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
      setIsError(true);
    }
  }

  const availableResources = resources.filter(
    (resource) => resource.status === "AVAILABLE"
  );

  const filteredReservations = reservations.filter((reservation) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      reservation.resource.name.toLowerCase().includes(query) ||
      reservation.user.name.toLowerCase().includes(query) ||
      reservation.user.email.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Resource Reservations
        </h1>

        <p className="mt-2 text-gray-600">
          Book a resource and manage your reservation schedule.
        </p>

        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Create a Reservation
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Your Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Select Resource *
              </label>
              <select
                required
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full rounded-lg border bg-white p-3"
              >
                <option value="">Choose a resource</option>
                {availableResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                    {resource.location
                      ? ` — ${resource.location}`
                      : ""}
                  </option>
                ))}
              </select>

              {resources.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  Add a resource before making a reservation.
                </p>
              )}

              {resources.length > 0 &&
                availableResources.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    No resources are currently available for booking.
                  </p>
                )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Start Date and Time *
              </label>
              <input
                required
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                End Date and Time *
              </label>
              <input
                required
                type="datetime-local"
                value={endTime}
                min={startTime || undefined}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Purpose
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What will the resource be used for?"
                rows={3}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving || availableResources.length === 0}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Booking..." : "Create Reservation"}
              </button>
            </div>
          </form>

          {message && (
            <p
              role="status"
              className={`mt-4 text-sm ${
                isError ? "text-red-600" : "text-green-700"
              }`}
            >
              {message}
            </p>
          )}
        </section>

        <section className="mt-8">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Reservations ({filteredReservations.length})
            </h2>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resource, name, or email..."
              className="w-full rounded-lg border bg-white p-3"
              aria-label="Search reservations"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border bg-white p-3"
              aria-label="Filter by reservation status"
            >
              <option value="ALL">All statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>


          {loading ? (
            <p className="mt-4 text-gray-600">
              Loading reservations...
            </p>
          ) : filteredReservations.length === 0 ? (
            <p className="mt-4 rounded-xl border bg-white p-6 text-gray-600">
              No reservations match your search or filter.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {filteredReservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {reservation.resource.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Reservation #{reservation.id}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          reservation.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {reservation.status}
                      </span>

                      {reservation.status === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(reservation.id)}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <p>
                      <strong>Reserved by:</strong> {reservation.user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {reservation.user.email}
                    </p>
                    <p>
                      <strong>Starts:</strong>{" "}
                      {new Date(reservation.startTime).toLocaleString()}
                    </p>
                    <p>
                      <strong>Ends:</strong>{" "}
                      {new Date(reservation.endTime).toLocaleString()}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {reservation.resource.location || "Not specified"}
                    </p>
                    <p>
                      <strong>Purpose:</strong>{" "}
                      {reservation.purpose || "Not specified"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
