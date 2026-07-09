import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "../components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Sip" },
      {
        name: "description",
        content:
          "How Sip handles your data. Sip stores your water logs locally on your device and does not collect personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Sip" },
      { property: "og:url", content: "https://sipwaterreminder.lovable.app/privacy" },
    ],
    links: [
      { rel: "canonical", href: "https://sipwaterreminder.lovable.app/privacy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <p>
        This Privacy Policy explains how <strong>Sip — Water Reminder</strong>{" "}
        ("Sip", "we", "our") handles information when you use our web
        application and Android app.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        Sip is designed to be privacy-first. We do <strong>not</strong> require
        an account and we do <strong>not</strong> collect personally
        identifiable information such as your name, phone number, or precise
        location.
      </p>
      <ul>
        <li>
          <strong>Water intake data:</strong> Your daily water logs, goal,
          streaks and reminder settings are stored{" "}
          <strong>locally on your device</strong> using your browser's
          localStorage. This data never leaves your device.
        </li>
        <li>
          <strong>Notification permission:</strong> If you enable hourly
          reminders, we ask the operating system for permission to show local
          notifications. No data is sent to any server.
        </li>
        <li>
          <strong>Anonymous ads (web only):</strong> The public web version may
          display Google AdSense ads, which use cookies as described in
          Google's advertising policies.
        </li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>
        The locally stored data is used only to display your hydration
        progress, calendar and reminders inside the app. We do not sell,
        rent or share your data.
      </p>

      <h2>3. Data Sharing</h2>
      <p>
        Sip does not share your personal data with third parties. There is no
        analytics SDK, no crash reporting SDK, and no advertising SDK inside
        the Android app.
      </p>

      <h2>4. Data Security</h2>
      <p>
        Data is stored on your device. The website is served exclusively over
        HTTPS. Because data lives on your device, its security is tied to the
        security of the device itself.
      </p>

      <h2>5. Data Deletion</h2>
      <p>
        You can delete all Sip data at any time from{" "}
        <em>Menu → Data → Reset all data</em>. Uninstalling the app also
        removes all locally stored data.
      </p>

      <h2>6. Children's Privacy</h2>
      <p>
        Sip is intended for a general audience aged 13 and above. We do not
        knowingly collect information from children under 13.
      </p>

      <h2>7. Permissions the App Requests</h2>
      <ul>
        <li>
          <strong>Notifications</strong> — to send optional hydration
          reminders.
        </li>
        <li>
          <strong>Internet</strong> — to load the web app on first open. Once
          loaded, most features work offline.
        </li>
      </ul>
      <p>
        Sip does <strong>not</strong> request access to contacts, SMS, call
        logs, background location, camera, microphone or storage.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. The "Last updated" date
        at the top reflects the latest revision. Continued use of Sip after
        changes constitutes acceptance of the updated policy.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy? Email us at{" "}
        <a href="mailto:prasadmanish2767@gmail.com">
          prasadmanish2767@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
