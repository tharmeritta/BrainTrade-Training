/**
 * Dashboard-specific layout — intentionally strips the shared NavBar.
 * AgentEntry and AgentTrainingHub both provide their own navigation chrome.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
