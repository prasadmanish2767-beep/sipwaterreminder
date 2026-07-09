import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "../components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Sip" },
      {
        name: "description",
        content:
          "Terms of use for the Sip water reminder app and website.",
      },
      { property: "og:title", content: "Terms & Conditions — Sip" },
      { property: "og:url", content: "https://sipwaterreminder.lovable.app/terms" },
    ],
    links: [
      { rel: "canonical", href: "https://sipwaterreminder.lovable.app/terms" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle={`Last updated: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <p>
        By using <strong>Sip — Water Reminder</strong> ("the App"), you agree
        to these Terms & Conditions. Please read them carefully.
      </p>

      <h2>1. Use of the App</h2>
      <p>
        Sip is a free hydration-tracking tool that helps you log water
        intake and receive optional reminders. You agree to use the App only
        for lawful, personal, non-commercial purposes.
      </p>

      <h2>2. Not Medical Advice</h2>
      <p>
        Sip is a <strong>wellness and lifestyle tool</strong> and is{" "}
        <strong>not a medical device</strong>. Water intake recommendations
        are general guidelines and are not a substitute for professional
        medical advice, diagnosis or treatment. Consult a qualified
        healthcare provider before making changes to your hydration for
        medical reasons.
      </p>

      <h2>3. Your Data</h2>
      <p>
        Your logs are stored locally on your device. You are responsible for
        backing them up if needed. See our{" "}
        <a href="/privacy">Privacy Policy</a> for details.
      </p>

      <h2>4. Reminders & Notifications</h2>
      <p>
        Reminders rely on your device's operating system. We cannot guarantee
        delivery of every notification, especially when the device is in
        battery-saver, Do-Not-Disturb, or aggressive background-restriction
        modes.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        All Sip branding, design, and code are owned by the Sip team. You may
        not copy, modify, distribute, or reverse-engineer the App except as
        permitted by law.
      </p>

      <h2>6. Disclaimer of Warranties</h2>
      <p>
        The App is provided "as is" and "as available" without warranties of
        any kind, express or implied, including fitness for a particular
        purpose or non-infringement.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Sip and its authors shall not
        be liable for any indirect, incidental, special, consequential or
        punitive damages arising from your use of the App.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may stop using the App at any time by uninstalling it. We may
        suspend or discontinue the App at any time without notice.
      </p>

      <h2>9. Changes to Terms</h2>
      <p>
        We may update these Terms occasionally. Continued use after changes
        means you accept the updated Terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:prasadmanish2767@gmail.com">
          prasadmanish2767@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
