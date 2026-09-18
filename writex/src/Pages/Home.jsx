import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  CheckCircle,
  Download,
  Eye,
  Folder,
  PenLine,
  Users,
} from "lucide-react";
import { GuestNav } from "@/components/home/GuestNav";
import { CanvasDemo } from "@/components/home/CanvasDemo";
import { FolderDemo } from "@/components/home/FolderDemo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useAuth } from "@/context/authContext";
import heroImg from "@/assets/secondSec.jpg";
import gridA from "@/assets/firstgrid.jpg";
import gridB from "@/assets/twoGrid.jpg";
import gridC from "@/assets/threeGrid.jpg";

const FEATURES = [
  {
    icon: PenLine,
    title: "Rich writing canvas",
    description:
      "Tables, code, images, highlights, task lists — TipTap tools without the clutter.",
  },
  {
    icon: Folder,
    title: "Folder library",
    description:
      "Nested pastel folders, pins, and room for your posts plus saved reads.",
  },
  {
    icon: Bookmark,
    title: "Passage bookmarks",
    description: "Mark lines while you write or read. Color pins stay on-device.",
  },
  {
    icon: Download,
    title: "PDF export",
    description: "Download clean PDFs of notes — lists, tables, and code included.",
  },
  {
    icon: Users,
    title: "Follow & feed",
    description: "Follow writers and switch into a following feed of fresh work.",
  },
  {
    icon: Eye,
    title: "Publish your way",
    description: "Auto-save, focus mode, public publish or keep it personal.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="wx-cool min-h-screen wx-sans">
      <GuestNav />

      {/* Full-bleed cinematic hero — dark media wash in both themes */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="wx-hero-shade absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--wx-glow),transparent_45%)]" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              Write · organize · share
            </p>
            <h1 className="wx-serif mt-5 text-[clamp(3.2rem,10vw,6rem)] text-white">
              Write what stays with you.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              A cinematic desk for drafts: rich canvas, folder library,
              bookmarks, PDF export, and a feed that feels human.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--wx-accent)] px-8 py-3.5 text-[15px] font-semibold text-[var(--wx-accent-fg)] transition hover:brightness-110"
              >
                Start writing free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/blogs")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Browse blogs
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
              {["Auto-save drafts", "Folders for own & saved", "Free forever"].map(
                (t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                    {t}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image gallery strip */}
      <section className="relative z-10 -mt-8 px-5 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          {[
            { src: gridA, label: "Draft nights" },
            { src: gridB, label: "Quiet focus" },
            { src: gridC, label: "Shared pages" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group relative h-48 overflow-hidden rounded-3xl sm:h-56"
            >
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute bottom-4 left-4 wx-serif text-2xl text-white">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Canvas */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--wx-accent)]">
            Writing canvas
          </p>
          <h2 className="wx-serif mt-3 text-[clamp(2rem,4.5vw,3rem)] text-[var(--wx-text)]">
            Tools that disappear while you write.
          </h2>
          <p className="mt-3 text-[var(--wx-mute)]">
            TipTap canvas with tables, code, images, highlights, focus mode, and
            auto-save.
          </p>
        </div>
        <CanvasDemo />
      </section>

      {/* Folders */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--wx-accent)]">
            Folder library
          </p>
          <h2 className="wx-serif mt-3 text-[clamp(2rem,4.5vw,3rem)] text-[var(--wx-text)]">
            Keep every draft where it belongs.
          </h2>
          <p className="mt-3 text-[var(--wx-mute)]">
            Nested folders, pastel colors, pinned shelves — for your posts and
            pieces you save.
          </p>
        </div>
        <FolderDemo />
      </section>

      {/* Features */}
      <section className="border-t border-[var(--wx-line)] bg-[var(--wx-soft)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="wx-serif mb-10 text-[clamp(2rem,4vw,2.75rem)] text-[var(--wx-text)]">
            Everything in one desk.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <article
                  key={f.title}
                  className="rounded-3xl border border-[var(--wx-line)] bg-[var(--wx-elev)] p-6"
                >
                  <Icon className="mb-4 h-5 w-5 text-[var(--wx-accent)]" />
                  <h3 className="wx-serif text-xl text-[var(--wx-text)]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--wx-mute)]">
                    {f.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA — photo band with fixed dark wash */}
      <section className="relative overflow-hidden">
        <img
          src={gridB}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/55 dark:bg-black/70" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <h2 className="wx-serif text-[clamp(2.25rem,5vw,3.5rem)] text-white">
            Open your desk tonight.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Free account. Canvas, folders, and feed — ready when you are.
          </p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--wx-accent)] px-9 py-3.5 text-[15px] font-semibold text-[var(--wx-accent-fg)] transition hover:brightness-110"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="border-t border-[var(--wx-line)] bg-[var(--wx-bg)]">
        <SiteFooter />
      </div>
    </div>
  );
};

export default Home;
