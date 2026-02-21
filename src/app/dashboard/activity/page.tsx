import { redirect } from 'next/navigation';

export default function DashboardActivityRedirect() {
  redirect('/app/activity');
}
