import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "../components/LegalLayout";
import { Droplet, Bell, Calendar, Shield } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Sip Water Reminder" },
      {
        name: "description",
        content:
          "About Sip — a minimal, privacy-first water reminder that helps you build a healthy hydration habit.",
      },
      { property: "og:title", content: "About — Sip Water Reminder" },
      { property: "og:url", content: "https://sipwaterreminder.lovable.app/about" },
    ],
    links: [
      { rel: "canonical", href: "https://sipwaterreminder.lovable.app/about" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <LegalLayout
      title="About Sip"
      subtitle="A gentle nudge to drink more water — beautifully simple."
    >
      <p>
        <strong>Sip</strong> is a minimal, privacy-first water reminder built
        for people who want to build a hydration habit without giving up
        their personal data. No sign-up, no tracking, no ads inside the
        Android app — just clean design and gentle reminders.
      </p>

      <h2>What Sip does</h2>
      <ul>
        <li>
          <Droplet className="mr-1 inline h-4 w-4 text-[#c58a1e]" />{" "}
          One-tap logging of water intake with customisable cup sizes.
        </li>
        <li>
          <Bell className="mr-1 inline h-4 w-4 text-[#c58a1e]" /> Hourly
          reminders with optional chime and Hindi voice prompt.
        </li>
        <li>
          <Calendar className="mr-1 inline h-4 w-4 text-[#c58a1e]" /> Streaks
          and calendar view to visualise your consistency.
        </li>
        <li>
          <Shield className="mr-1 inline h-4 w-4 text-[#c58a1e]" /> All data
          stays on your device — nothing is uploaded.
        </li>
      </ul>

      <h2>Our mission</h2>
      <p>
        Most people are chronically dehydrated by a small margin every day.
        Sip's mission is to make consistent hydration effortless with
        low-friction reminders and a delightful interface — without turning
        your habit data into a product.
      </p>

      <h2>Made by</h2>
      <p>
        Sip is an independent project. For feedback, feature requests, or
        partnerships, please reach out via our{" "}
        <a href="/contact">contact page</a>.
      </p>

      <h2>Version</h2>
      <p>v1.0.0 · Web + Android</p>
    </LegalLayout>
  );
}
