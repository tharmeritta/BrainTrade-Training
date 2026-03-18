'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LangToggle() {
  const pathname = usePathname();
  const router   = useRouter();

  const segments   = pathname.split('/');
  const locale     = segments[1] === 'en' ? 'en' : 'th';
  const nextLocale = locale === 'en' ? 'th' : 'en';

  function toggle() {
    const newSegments = [...segments];
    newSegments[1] = nextLocale;
    document.cookie = `locale=${nextLocale};path=/;max-age=31536000`;
    router.push(newSegments.join('/'));
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="flex items-center justify-center h-8 px-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      {locale === 'en' ? 'TH' : 'EN'}
    </button>
  );
}
