import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "@/assets/logo.png";

const links = [
  { to: "/blogs", label: "Read" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
  { to: "/community", label: "Community" },
];

export function GuestNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src={logo} alt="WriteX" className="wx-logo-media h-8 w-auto" />
          <span className="wx-serif text-2xl tracking-tight text-white">
            WriteX
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex wx-sans text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-3.5 py-2 text-white/75 transition hover:bg-white/15 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="rounded-full px-3.5 py-2 text-white/75 transition hover:bg-white/15 hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="ml-1 rounded-full bg-[var(--wx-accent)] px-4 py-2 font-semibold text-[var(--wx-accent-fg)] transition hover:brightness-110"
          >
            Start writing
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex rounded-full border border-white/25 bg-white/10 p-2 text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="wx-glass mx-4 rounded-2xl p-4 md:hidden wx-sans">
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
