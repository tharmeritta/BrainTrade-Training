import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="th">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">404 - Not Found</h2>
          <p className="opacity-70 mb-8">The page you are looking for does not exist.</p>
          <Link href="/th" className="px-4 py-2 bg-primary text-white rounded-xl font-bold">
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
