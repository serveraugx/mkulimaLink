import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Create Account</h1>
        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Min 8 characters"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-500"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
}
