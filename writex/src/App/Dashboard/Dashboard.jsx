import React from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import FirstGrid from "../../assets/firstgrid.jpg";
import twoGrid from "../../assets/twoGrid.jpg";
import threeGrid from "../../assets/threeGrid.jpg";
import secondSec from "../../assets/secondSec.jpg";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FolderOpen,
  PenLine,
  Sparkles,
} from "lucide-react";

const DESK_ACTIONS = [
  {
    title: "Continue writing",
    description: "Open a calm canvas with auto-save, focus mode, and bookmarks.",
    path: "/write",
    icon: PenLine,
  },
  {
    title: "Your library",
    description: "Drafts, folders, and saved reads — one place for every page.",
    path: "/myblogs",
    icon: FolderOpen,
  },
  {
    title: "Read the feed",
    description: "Browse published work and follow writers you care about.",
    path: "/blogs",
    icon: BookOpen,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.username
    ? user.username[0].toUpperCase() + user.username.slice(1)
    : "Writer";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-16">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Your desk
            </p>
            <h1 className="wx-serif mt-3 text-[clamp(2.5rem,6vw,4.25rem)] text-foreground">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pick up a draft, tidy the library, or start a fresh page — WriteX
              stays quiet while you work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/write")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Start writing
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/myblogs")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-[15px] font-semibold text-foreground transition hover:bg-muted"
              >
                Open library
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-12 grid gap-4 sm:grid-cols-3"
          >
            {DESK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="group rounded-3xl border border-border bg-card p-6 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <Icon className="mb-4 h-5 w-5 text-primary" />
                  <h2 className="wx-serif text-2xl text-foreground">{action.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition group-hover:opacity-100">
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          {[
            { src: FirstGrid, label: "Draft nights" },
            { src: twoGrid, label: "Quiet focus" },
            { src: threeGrid, label: "Shared pages" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
              className="group relative h-44 overflow-hidden rounded-3xl sm:h-52"
            >
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="wx-serif absolute bottom-4 left-4 text-2xl text-white">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
          <img
            src={secondSec}
            alt=""
            className="h-[320px] w-full object-cover sm:h-[380px]"
          />
          <div className="absolute inset-0 bg-slate-950/55 dark:bg-black/65" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 dark:text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Ready when you are
            </p>
            <h2 className="wx-serif max-w-xl text-[clamp(2rem,4vw,3rem)] text-white">
              Got something to say?
            </h2>
            <p className="mt-3 max-w-md text-white/80">
              A quiet canvas for drafts, folders, and pages that stay with you.
            </p>
            <button
              type="button"
              onClick={() => navigate("/write")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Open the canvas
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
