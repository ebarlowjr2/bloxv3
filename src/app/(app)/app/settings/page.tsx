import Layout from '@/components/Layout';

export const metadata = {
  title: 'Settings - BLOX AI CEO',
  description: 'BLOX settings and preferences',
};

export default function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Settings will be available here once authentication and workspace configuration are enabled.
        </p>
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          Configure organization details, notification preferences, and integrations.
        </div>
      </div>
    </Layout>
  );
}
