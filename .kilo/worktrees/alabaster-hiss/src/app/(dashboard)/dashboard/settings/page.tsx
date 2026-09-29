import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Account Settings</h1>
      <div className="max-w-xl rounded-xl border border-slate-700 bg-slate-800 p-6">
        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="displayName">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              defaultValue="John Doe"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="settingsEmail">
              Email Address
            </label>
            <input
              id="settingsEmail"
              type="email"
              defaultValue="john@example.com"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-500"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
