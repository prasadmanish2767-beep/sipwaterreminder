import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "../components/LegalLayout";
import { Mail, MessageCircle, Bug } from "lucide-react";

const EMAIL = "prasadmanish2767@gmail.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sip Water Reminder" },
      {
        name: "description",
        content:
          "Get in touch with the Sip team for feedback, support, or bug reports.",
      },
      { property: "og:title", content: "Contact — Sip Water Reminder" },
      { property: "og:url", content: "https://sipwaterreminder.lovable.app/contact" },
    ],
    links: [
      { rel: "canonical", href: "https://sipwaterreminder.lovable.app/contact" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalLayout
      title="Contact us"
      subtitle="We reply within 2–3 working days."
    >
      <p>
        Whether it's a feature request, a bug, or just a hello — we'd love to
        hear from you.
      </p>

      <div className="not-prose mt-6 grid gap-3 sm:grid-cols-1">
        <a
          href={`mailto:${EMAIL}?subject=Sip%20—%20Feedback`}
          className="flex items-center gap-3 rounded-2xl border border-[#e8d9b3] bg-white p-4 shadow-sm transition hover:border-[#f2b84b] hover:shadow"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7e4b8] text-[#2a1f10]">
            <Mail className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#2a1f10]">
              General enquiries
            </span>
            <span className="block truncate text-xs text-[#7a6640]">
              {EMAIL}
            </span>
          </span>
        </a>

        <a
          href={`mailto:${EMAIL}?subject=Sip%20—%20Bug%20report&body=Device%3A%20%0AAndroid%20version%3A%20%0AWhat%20happened%3A%20%0ASteps%20to%20reproduce%3A%20`}
          className="flex items-center gap-3 rounded-2xl border border-[#e8d9b3] bg-white p-4 shadow-sm transition hover:border-[#f2b84b] hover:shadow"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7e4b8] text-[#2a1f10]">
            <Bug className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#2a1f10]">
              Report a bug
            </span>
            <span className="block truncate text-xs text-[#7a6640]">
              Include your device model and Android version
            </span>
          </span>
        </a>

        <a
          href={`mailto:${EMAIL}?subject=Sip%20—%20Feature%20request`}
          className="flex items-center gap-3 rounded-2xl border border-[#e8d9b3] bg-white p-4 shadow-sm transition hover:border-[#f2b84b] hover:shadow"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7e4b8] text-[#2a1f10]">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#2a1f10]">
              Suggest a feature
            </span>
            <span className="block truncate text-xs text-[#7a6640]">
              What would make Sip better for you?
            </span>
          </span>
        </a>
      </div>

      <h2>Business address</h2>
      <p>
        Sip is operated by an independent developer based in India. For
        postal correspondence, please email us first and we will share the
        address privately.
      </p>

      <h2>Response time</h2>
      <p>
        We aim to respond within 2–3 business days. Bug reports with clear
        reproduction steps get priority.
      </p>
    </LegalLayout>
  );
}
