import { redirect } from 'next/navigation';

export default function DashboardAgentRedirect() {
  redirect('/app/agent');
}
