import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HelpCircle,
  KeyRound,
  LogIn,
  Mail,
  Shield,
  BookOpen,
} from "lucide-react";
import { GuestNav } from "@/components/home/GuestNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

const TOPICS = [
  {
    icon: LogIn,
    title: "Sign in & Google",
    body: "Use email/password or Continue with Google. Same email always maps to one WriteX account.",
  },
  {
    icon: KeyRound,
    title: "Forgot password",
    body: "On the login page, enter your email, then tap Forgot password. We’ll send a reset link.",
  },
  {
    icon: BookOpen,
    title: "Drafts & publishing",
    body: "Write on the canvas, organize in folders, then publish when ready. Drafts auto-save while you work.",
  },
  {
    icon: Shield,
    title: "Account & privacy",
    body: "Your profile, blogs, and follows stay tied to your account whether you use password or Google.",
  },
];

const FAQS = [
  {
    q: "I signed in with Google but don’t see my old posts.",
    a: "Sign in with the same email you used before. WriteX links Google and password accounts by verified email.",
  },
  {
    q: "Google login redirects but I’m stuck loading.",
    a: "Hard refresh once (Ctrl+Shift+R). If it persists, clear site data for this domain and try Google again.",
  },
  {
    q: "Logout doesn’t seem to work.",
    a: "Use Logout from the profile menu once. You should return to the home page. Then sign in again if needed.",
  },
  {
    q: "How do I contact the team?",
    a: "Email us at the address below with your account email and a short description of the issue.",
  },
];

const SUPPORT_EMAIL = "hello@veriencestudio.com";

export default function Support() {
  return (
    <div className="wx-cool min-h-screen wx-sans">
      <div className="relative overflow-hidden">
        <div className="wx-auth-light-bg absolute inset-0" />
        <div className="relative z-10">
          <GuestNav tone="page" />

          <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--wx-accent)]">
                Help
              </p>
              <h1 className="wx-serif mt-3 text-4xl text-[var(--wx-text)] sm:text-5xl">
                Support
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--wx-mute)]">
                Quick answers for login, writing, and your account. Still stuck?
                Reach out — we’ll help.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {TOPICS.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="wx-glass rounded-2xl p-5"
                >
                  <Icon className="h-5 w-5 text-[var(--wx-accent)]" />
                  <h2 className="mt-3 text-base font-semibold text-[var(--wx-text)]">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--wx-mute)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-12">
              <div className="mb-5 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--wx-accent)]" />
                <h2 className="wx-serif text-2xl text-[var(--wx-text)]">
                  Common questions
                </h2>
              </div>
              <ul className="space-y-4">
                {FAQS.map((item) => (
                  <li
                    key={item.q}
                    className="rounded-2xl border border-[var(--wx-line)] bg-[var(--wx-elev)] px-5 py-4"
                  >
                    <p className="text-sm font-semibold text-[var(--wx-text)]">
                      {item.q}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--wx-mute)]">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="wx-glass mt-12 rounded-2xl p-6 sm:p-8">
              <Mail className="h-5 w-5 text-[var(--wx-accent)]" />
              <h2 className="wx-serif mt-3 text-2xl text-[var(--wx-text)]">
                Contact us
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--wx-mute)]">
                Include the email on your WriteX account and what you were trying
                to do. We usually reply within 1–2 business days.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=hello%20veriencestudio.com`}
                className="mt-5 inline-flex rounded-full bg-[var(--wx-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--wx-accent-fg)] transition hover:brightness-110"
              >
                Email {SUPPORT_EMAIL}
              </a>
              <p className="mt-4 text-sm text-[var(--wx-mute)]">
                Or go back to{" "}
                <Link
                  to="/"
                  className="font-semibold text-[var(--wx-accent)] hover:underline"
                >
                  the home page
                </Link>
                .
              </p>
            </section>
          </main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
