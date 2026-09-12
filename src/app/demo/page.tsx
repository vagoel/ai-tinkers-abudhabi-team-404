import Link from "next/link";
import VoiceWidgetMount from "@/components/VoiceWidgetMount";

export const metadata = {
  title: "Corniche Health Clinic — Voice Demo",
  description:
    "A sample website used to demo the voice-first accessibility layer.",
};

const services = [
  {
    name: "General Practice",
    price: "AED 250",
    desc: "Everyday check-ups, illness, and referrals with our family doctors.",
  },
  {
    name: "Dental Care",
    price: "AED 400",
    desc: "Cleaning, whitening, fillings and routine dental examinations.",
  },
  {
    name: "Physiotherapy",
    price: "AED 320",
    desc: "Recovery and mobility programs led by licensed physiotherapists.",
  },
  {
    name: "Dermatology",
    price: "AED 500",
    desc: "Skin, hair and nail consultations with same-week appointments.",
  },
];

const hours = [
  ["Monday – Thursday", "8:00 AM – 8:00 PM"],
  ["Friday", "2:00 PM – 8:00 PM"],
  ["Saturday", "9:00 AM – 5:00 PM"],
  ["Sunday", "Closed"],
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-teal-700">
            Corniche Health Clinic
          </span>
          <ul className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
            <li>
              <a href="#services" className="hover:text-teal-700">
                Services
              </a>
            </li>
            <li>
              <a href="#hours" className="hover:text-teal-700">
                Hours
              </a>
            </li>
            <li>
              <a href="#book" className="hover:text-teal-700">
                Book
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-teal-700">
                Contact
              </a>
            </li>
          </ul>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 hover:text-slate-600"
          >
            ← Home
          </Link>
        </nav>
      </header>

      <section
        id="hero"
        className="mx-auto max-w-5xl px-6 py-20 text-center"
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">
          Now with voice
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Modern healthcare for the Abu Dhabi community
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Same-week appointments, transparent pricing, and a friendly team.
          Try the microphone in the corner and just say what you need — for
          example, &ldquo;book a dental appointment for Saturday.&rdquo;
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#book"
            className="rounded-full bg-teal-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-teal-500"
          >
            Book an appointment
          </a>
          <a
            href="#services"
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-slate-400"
          >
            View services
          </a>
        </div>
      </section>

      <section id="services" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Our services</h2>
          <p className="mt-2 text-slate-600">
            Clear, upfront pricing on every visit.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <article
                key={s.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-semibold">{s.name}</h3>
                  <span className="font-semibold text-teal-700">{s.price}</span>
                </div>
                <p className="mt-3 text-slate-600">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hours" className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Opening hours</h2>
          <dl className="mt-8 max-w-md divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {hours.map(([day, time]) => (
              <div
                key={day}
                className="flex items-center justify-between px-5 py-4"
              >
                <dt className="font-medium text-slate-700">{day}</dt>
                <dd className="text-slate-600">{time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="book" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Book an appointment
          </h2>
          <p className="mt-2 text-slate-600">
            Fill this in yourself, or let the voice assistant do it for you.
          </p>
          <form
            className="mt-8 grid gap-5"
            action="#book"
            aria-label="Appointment booking form"
          >
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="service" className="text-sm font-medium">
                Service
              </label>
              <select
                id="service"
                name="service"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              >
                {services.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Preferred date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Anything we should know?"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-teal-500"
            >
              Confirm booking
            </button>
          </form>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Contact us</h2>
          <div className="mt-6 grid gap-2 text-slate-600">
            <p>Corniche Road, Abu Dhabi, UAE</p>
            <p>Phone: +971 2 000 0000</p>
            <p>Email: hello@marinabayclinic.example</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        Demo site for the AI Tinkerers Abu Dhabi hackathon. Not a real clinic.
      </footer>

      <VoiceWidgetMount />
    </main>
  );
}
