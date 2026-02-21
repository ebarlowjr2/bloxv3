import { redirect } from 'next/navigation';

export default function DashboardSettingsRedirect() {
  redirect('/app/settings');
}
