import Image from "next/image";


export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Resource Reservation System
          </h1>

          <p className="mt-2 text-slate-600">
            Manage resources and reservations in one place.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Total Resources
            </h2>
            <p className="mt-3 text-3xl font-bold text-blue-600">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Upcoming Reservations
            </h2>
            <p className="mt-3 text-3xl font-bold text-green-600">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Available Resources
            </h2>
            <p className="mt-3 text-3xl font-bold text-purple-600">0</p>
          </div>
        </section>

        <section className="mt-10 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome!
          </h2>

          <p className="mt-3 text-slate-600">
            Start by adding resources, checking their availability,
            and creating reservations.
          </p>
        </section>
      </div>
    </main>
  );
}

