export const metadata = {
  title: 'Login Required - BLOX AI CEO',
  description: 'Authentication required to access the BLOX app shell',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Login required</h1>
        <p className="mt-2 text-sm text-slate-600">
          This BLOX v3 app shell is UI-only right now. Enable access by setting
          <span className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">BYPASS_AUTH=true</span>
          in your environment.
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          Auth wiring can be added later once the UI is finalized.
        </div>
      </div>
    </div>
  );
}
