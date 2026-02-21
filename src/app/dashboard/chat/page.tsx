import { redirect } from 'next/navigation';

export default function DashboardChatRedirect() {
  redirect('/app/chat');
}
