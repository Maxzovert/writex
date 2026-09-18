import { Link } from "react-router-dom"
import { HelpCircle, Moon, Sun, Trash2, User } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useTheme } from "../../context/themeContext"
import { cn } from "@/lib/utils"

const Settings = () => {
  const { theme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Account
          </p>
          <h1 className="wx-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Appearance and shortcuts for your WriteX account.
          </p>

          <section className="mt-10 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/90 px-4 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-muted p-2 text-muted-foreground">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Appearance</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark" ? "Dark mode" : "Light mode"}
                  </p>
                </div>
              </div>
              <ThemeToggle className="h-10 w-10 shrink-0 shadow-none" />
            </div>

            <Link
              to="/profile"
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-4 transition",
                "hover:bg-muted/60"
              )}
            >
              <span className="rounded-xl bg-muted p-2 text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Profile</p>
                <p className="text-sm text-muted-foreground">
                  Name, bio, photo, and social links
                </p>
              </div>
            </Link>

            <Link
              to="/myblogs?view=trash"
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-4 transition",
                "hover:bg-muted/60"
              )}
            >
              <span className="rounded-xl bg-muted p-2 text-muted-foreground">
                <Trash2 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Recycle Bin</p>
                <p className="text-sm text-muted-foreground">
                  Restore or permanently delete posts
                </p>
              </div>
            </Link>

            <Link
              to="/support"
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-4 transition",
                "hover:bg-muted/60"
              )}
            >
              <span className="rounded-xl bg-muted p-2 text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Help & support</p>
                <p className="text-sm text-muted-foreground">
                  FAQs and how to contact us
                </p>
              </div>
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Settings
