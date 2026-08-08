import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "../components/LegalLayout";

export const Route = createFileRoute("/data-deletion")({
  head: () => ({
    meta: [
      { title: "Delete Your Data — Sip Water Reminder" },
      {
        name: "description",
        content:
          "How to permanently delete all Sip water reminder data from your device. No account, no server copies, deletion in one tap.",
      },
      { property: "og:title", content: "Delete Your Data — Sip" },
      {
        property: "og:description",
        content:
          "Step-by-step instructions to erase all Sip hydration data from your device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:url",
        content: "https://sipwaterreminder.lovable.app/data-deletion",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://sipwaterreminder.lovable.app/data-deletion",
      },
    ],
  }),
  component: DataDeletionPage,
});

function DataDeletionPage() {
  return (
    <LegalLayout
      title="Delete Your Data"
      subtitle="Account & data deletion — Sip — Water Reminder (app.sip.waterreminder)"
    >
      <p>
        Sip has <strong>no accounts and no servers</strong>. Every log, goal,
        cup size and reminder setting lives only in your device's local
        storage. Nothing is uploaded, so deleting on-device data deletes
        everything we could ever hold.
      </p>

      <h2>1. Delete from inside the app (recommended)</h2>
      <ol>
        <li>Open Sip.</li>
        <li>
          Tap the <strong>menu icon</strong> (top right) or{" "}
          <strong>Profile</strong> in the bottom bar.
        </li>
        <li>
          Scroll to <strong>Data → Reset all data</strong>.
        </li>
        <li>
          Confirm <strong>Delete all</strong>.
        </li>
      </ol>
      <p>
        This immediately and permanently erases all hydration logs, streaks,
        achievements, custom cups, daily goal, unit preference and reminder
        schedule.
      </p>

      <h2>2. Delete by uninstalling</h2>
      <p>
        Uninstalling the Android app (or clearing site data in your browser for
        the web version) removes 100% of stored data. There is no backup copy
        anywhere.
      </p>

      <h2>3. What is deleted</h2>
      <ul>
        <li>Daily water logs and history</li>
        <li>Streaks, badges and weekly insights</li>
        <li>Daily goal, unit (ml / oz / cups) and custom cup sizes</li>
        <li>Reminder times, quiet hours, sound and voice settings</li>
        <li>Onboarding and consent flags</li>
      </ul>

      <h2>4. What is retained</h2>
      <p>
        <strong>Nothing.</strong> We do not keep any user data after deletion
        because we never receive it in the first place. No retention period
        applies.
      </p>

      <h2>5. Request help</h2>
      <p>
        If you cannot access the app and want confirmation of our data
        practices, email{" "}
        <a href="mailto:prasadmanish2767@gmail.com">
          prasadmanish2767@gmail.com
        </a>{" "}
        with the subject "Data deletion". We reply within 7 days.
      </p>

      <p>
        See also our <Link to="/privacy">Privacy Policy</Link> and{" "}
        <Link to="/terms">Terms & Conditions</Link>.
      </p>
    </LegalLayout>
  );
}
