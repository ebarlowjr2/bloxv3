import Layout from '@/components/Layout';
import AgentDashboard from '@/components/AgentDashboard';

export const metadata = {
  title: 'Agents - BLOX AI CEO',
  description: 'BLOX agent management and status overview',
};

export default function AgentPage() {
  return (
    <Layout>
      <AgentDashboard />
    </Layout>
  );
}
