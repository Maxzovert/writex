import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import panelImg from "@/assets/secondSec.jpg";
import gridA from "@/assets/firstgrid.jpg";
import gridB from "@/assets/twoGrid.jpg";

export function AuthShell({
  mode = "login",
  heading,
  subheading,
  children,
  footer,
}) {
  const isSignup = mode === "signup";

  return (
    <div className="wx-cool relative min-h-screen overflow-x-hidden wx-sans">
      {/* Light: clean gradient. Dark: cinematic photo. */}
      <div className="wx-auth-light-bg absolute inset-0 dark:hidden" />
      <div className="absolute inset-0 hidden dark:block">
        <img
          src={panelImg}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/72" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-10">
        <aside className="mb-6 flex-1 lg:mb-0">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logo} alt="WriteX" className="wx-logo-auth h-8 w-auto" />
            <span className="wx-script text-3xl text-[var(--wx-text)]">WriteX</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 hidden max-w-lg lg:block"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--wx-accent)]">
              {isSignup ? "Begin a page" : "Welcome back"}
            </p>
            <h1 className="wx-serif mt-4 text-5xl text-[var(--wx-text)] xl:text-6xl">
              {isSignup
                ? "Your canvas and library await."
                : "Back to the desk."}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[var(--wx-mute)]">
              {isSignup
                ? "Drafts, folders, bookmarks, and PDF export — in one calm place."
                : "Continue writing, organizing, and reading where you left off."}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <img
                src={gridA}
                alt=""
                className="h-32 w-full rounded-2xl object-cover shadow-md ring-1 ring-[var(--wx-line)]"
              />
              <img
                src={gridB}
                alt=""
                className="h-32 w-full rounded-2xl object-cover shadow-md ring-1 ring-[var(--wx-line)]"
              />
            </div>
          </motion.div>
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto w-full max-w-md pb-8 lg:pb-0"
        >
          <div className="wx-glass rounded-[1.75rem] p-6 sm:p-8">
            <h2 className="wx-serif text-3xl text-[var(--wx-text)]">{heading}</h2>
            {subheading ? (
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--wx-mute)]">
                {subheading}
              </p>
            ) : null}
            <div className="mt-5">{children}</div>
            {footer ? (
              <div className="mt-5 border-t border-[var(--wx-line)] pt-5">
                {footer}
              </div>
            ) : null}
          </div>
        </motion.main>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  rightSlot,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--wx-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full rounded-xl border border-[var(--wx-line)] bg-[var(--wx-soft)] px-3.5 py-2.5 text-[15px] text-[var(--wx-text)] outline-none transition placeholder:text-[var(--wx-mute)] focus:border-[var(--wx-accent)] focus:bg-[var(--wx-elev)] focus:ring-4 focus:ring-[var(--wx-accent)]/15 ${
            rightSlot ? "pr-11" : ""
          }`}
        />
        {rightSlot}
      </div>
    </div>
  );
}

export function AuthSubmit({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-[var(--wx-accent)] px-4 py-2.5 text-[15px] font-semibold text-[var(--wx-accent-fg)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
