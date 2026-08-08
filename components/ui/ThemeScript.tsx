'use client';

import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        var stored = localStorage.getItem('brainstrade_theme');
        var theme = stored === 'dark' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', theme === 'dark');
      } catch(e) {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;

  useServerInsertedHTML(() => (
    <script
      id="theme-strategy"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  ));

  return null;
}
