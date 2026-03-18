import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'th'],

  // Used when no locale matches
  defaultLocale: 'th',
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (static files)
    // - _static (public files)
    // - _vercel (Vercel specific files)
    // - all files with an extension (e.g. favicon.ico)
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
    // Match the root
    '/'
  ]
};
