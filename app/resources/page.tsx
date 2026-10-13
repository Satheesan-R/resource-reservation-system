"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Resource = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  capacity: number | null;
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadResources() {
    try {
      const response = await fetch("/api/resources");

      if (!response.ok) {
        throw new Error("Could not load resources");
      }

      const data: Resource[] = await response.json();
      setResources(data);
    } catch {
      setMessage("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const load = async () => {
      await loadResources();
    };

    void load();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          location,
          capacity: capacity ? Number(capacity) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add resource");
      }

      setMessage("Resource added successfully!");
      setName("");
      setDescription("");
      setLocation("");
      setCapacity("");

      await loadResources();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    id: number,
    status: Resource["status"]
  ) {
    setMessage("");

    try {
      const response = await fetch("/api/resources", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setMessage("Resource status updated successfully!");
      await loadResources();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }

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
          Resource Management
        </h1>

        <p className="mt-2 text-gray-600">
          Add resources and view the resources already registered
          in the system.
        </p>

        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Add a Resource
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Resource Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meeting Room B"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Floor 2"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Capacity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 10 people"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the resource"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Resource"}
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-sm" role="status">
              {message}
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Registered Resources ({resources.length})
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-600">
              Loading resources...
            </p>
          ) : resources.length === 0 ? (
            <p className="mt-4 rounded-xl border bg-white p-6 text-gray-600">
              No resources have been added yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">
                      {resource.name}
                    </h3>

                    <select
                      value={resource.status}
                      onChange={(e) =>
                        handleStatusChange(
                          resource.id,
                          e.target.value as Resource["status"]
                        )
                      }
                      aria-label={`Change status of ${resource.name}`}
                      className="rounded-lg border bg-white px-3 py-2 text-sm"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    {resource.description || "No description"}
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-gray-700">
                    <p>
                      <strong>Location:</strong>{" "}
                      {resource.location || "Not specified"}
                    </p>
                    <p>
                      <strong>Capacity:</strong>{" "}
                      {resource.capacity ?? "Not specified"}
                    </p>
                    <p>
                      <strong>Resource ID:</strong> {resource.id}
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
