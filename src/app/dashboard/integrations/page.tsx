import { redirect } from 'next/navigation';

export default function DashboardIntegrationsRedirect() {
  redirect('/app/integrations');
}
