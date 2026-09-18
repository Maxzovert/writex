import Navbar from "@/App/Components/Navbar";

/**
 * Viewport-locked shell. Children get a definite height; each page owns scrolling.
 */
export function AppShell({ children, showNavbar = true }) {
  return (
    <div className="wx-desk-bg wx-sans flex h-svh max-h-svh flex-col overflow-hidden text-foreground">
      {showNavbar ? <Navbar /> : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default AppShell;
