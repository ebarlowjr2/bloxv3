import { NextResponse } from 'next/server';

const activities = [
  { agent: 'M.A.R.K.', action: 'sent outreach emails', icon: 'Mail' },
  { agent: 'C.Y.R.A.', action: 'closed security incident', icon: 'ShieldCheck' },
  { agent: 'A.L.E.X.', action: 'scheduled team meeting', icon: 'Calendar' },
  { agent: 'T.O.N.Y.', action: 'merged PR', icon: 'Github' },
  { agent: 'F.I.N.T.', action: 'processed financial data', icon: 'DollarSign' },
  { agent: 'C.O.R.Y.', action: 'generated creative assets', icon: 'Image' },
  { agent: 'H.A.L.I.', action: 'updated HR records', icon: 'Users' },
  { agent: 'S.A.G.E.', action: 'posted social media content', icon: 'Share' },
];

export async function GET() {
  try {
    const recentActivity = Array.from({ length: 4 }, (_, index) => {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const timeAgo = Math.floor(Math.random() * 120) + 1;
      const timeUnit = timeAgo < 60 ? 'm' : 'h';
      const timeValue = timeAgo < 60 ? timeAgo : Math.floor(timeAgo / 60);
      
      return {
        id: index + 1,
        title: `${activity.agent} ${activity.action}`,
        time: `${timeValue}${timeUnit} ago`,
        icon: activity.icon,
        status: 'success',
        agent: activity.agent,
      };
    }).sort((a, b) => {
      const aMinutes = a.time.includes('h') ? parseInt(a.time) * 60 : parseInt(a.time);
      const bMinutes = b.time.includes('h') ? parseInt(b.time) * 60 : parseInt(b.time);
      return aMinutes - bMinutes;
    });

    return NextResponse.json({
      success: true,
      data: {
        recentActivity,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Dashboard activity API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch activity data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
