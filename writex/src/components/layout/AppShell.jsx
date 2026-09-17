import Navbar from "@/App/Components/Navbar";

/**
 * Authenticated writing-desk shell: atmosphere + shared Navbar.
 */
export function AppShell({ children, showNavbar = true }) {
  return (
    <div className="wx-desk-bg wx-sans flex min-h-screen flex-col text-foreground">
      {showNavbar ? <Navbar /> : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export default AppShell;
