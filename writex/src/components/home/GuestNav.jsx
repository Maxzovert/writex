import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { to: "/blogs", label: "Read" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
  { to: "/community", label: "Community" },
];

/**
 * @param {{ tone?: "media" | "page" }} props
 * media = white links over hero photo; page = ink links on light/dark page bg
 */
export function GuestNav({ tone = "media" }) {
  const [open, setOpen] = useState(false);
  const onMedia = tone === "media";

  return (
    <header
      className={cn(
        onMedia ? "absolute inset-x-0 top-0 z-50" : "relative z-50 border-b border-[var(--wx-line)]"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img
            src={logo}
            alt="WriteX"
            className={cn("h-8 w-auto", onMedia ? "wx-logo-media" : "wx-logo-auth")}
          />
          <span
            className={cn(
              "wx-script text-3xl tracking-tight",
              onMedia ? "text-white" : "text-[var(--wx-text)]"
            )}
          >
            WriteX
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex wx-sans text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-full px-3.5 py-2 transition",
                onMedia
                  ? "text-white/75 hover:bg-white/15 hover:text-white"
                  : "text-[var(--wx-mute)] hover:bg-[var(--wx-soft)] hover:text-[var(--wx-text)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className={cn(
              "rounded-full px-3.5 py-2 transition",
              onMedia
                ? "text-white/75 hover:bg-white/15 hover:text-white"
                : "text-[var(--wx-mute)] hover:bg-[var(--wx-soft)] hover:text-[var(--wx-text)]"
            )}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="ml-1 rounded-full bg-[var(--wx-accent)] px-4 py-2 font-semibold text-[var(--wx-accent-fg)] transition hover:brightness-110"
          >
            Start writing
          </Link>
          <ThemeToggle className="ml-1 h-9 w-9 shadow-none" />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle className="h-9 w-9 shadow-none" />
          <button
            type="button"
            className={cn(
              "inline-flex rounded-full p-2",
              onMedia
                ? "border border-white/25 bg-white/10 text-white"
                : "border border-[var(--wx-line)] bg-[var(--wx-soft)] text-[var(--wx-text)]"
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="wx-glass mx-4 mb-4 rounded-2xl p-4 md:hidden wx-sans">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-[var(--wx-text)]/85"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-3 text-[var(--wx-text)]/85"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-[var(--wx-accent)] px-4 py-3 text-center font-semibold text-[var(--wx-accent-fg)]"
          >
            Start writing
          </Link>
        </div>
      ) : null}
    </header>
  );
}
