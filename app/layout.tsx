import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrainTrade Training',
  description: 'Sales Agent Training Platform',
};

// Inline script runs synchronously before paint — prevents theme flash.
// Defaults to 'dark' if no preference is stored.
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('brainstrade_theme');
      var theme = stored === 'light' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } catch(e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="dark">
      <head>
        {/* Theme: must run before paint to prevent flash */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Fonts: preconnect first, then load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
        />
      </head>
      <body className="bg-background min-h-screen antialiased" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
