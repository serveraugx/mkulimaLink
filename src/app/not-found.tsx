export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-slate-400">The page you are looking for does not exist.</p>
      <a href="/" className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-500">
        Return Home
      </a>
    </main>
  );
}
