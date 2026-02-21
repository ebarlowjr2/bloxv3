import React from 'react';
import Layout from '@/components/Layout';
import BloxHome from '@/components/BloxHome';

export default function DashboardPage() {
  return (
    <Layout>
      <BloxHome />
    </Layout>
  );
}

export const metadata = {
  title: 'Dashboard - BLOX AI CEO',
  description: 'BLOX AI CEO Dashboard with real-time agent monitoring and system health',
};
