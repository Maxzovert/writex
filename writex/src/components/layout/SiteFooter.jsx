import { Link } from "react-router-dom";
import { PenTool } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src={logo} alt="Writex" className="h-9 w-auto" />
              <span className="text-xl font-semibold text-foreground">Writex</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A calm space to write, publish, and share your stories with readers who care.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/blogs" className="transition-colors hover:text-foreground">
                  Browse blogs
                </Link>
              </li>
              <li>
                <Link to="/write" className="transition-colors hover:text-foreground">
                  Start writing
                </Link>
              </li>
              <li>
                <Link to="/myblogs" className="transition-colors hover:text-foreground">
                  My blogs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="transition-colors hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition-colors hover:text-foreground">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Writex. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <PenTool className="h-3.5 w-3.5" />
            <span>Built for writers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
