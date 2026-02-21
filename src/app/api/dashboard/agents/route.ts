import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const agents = [
      {
        key: "MARK",
        name: "M.A.R.K.",
        subtitle: "Marketing, Automation, Research & Knowledge",
        color: "bg-sky-500",
        status: Math.random() > 0.3 ? "online" : "offline",
        tools: ["Gmail", "Google Drive", "Google Search", "Twilio SMS", "HubSpot"],
        lastActivity: `${Math.floor(Math.random() * 30) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 10) + 5,
      },
      {
        key: "CORY",
        name: "C.O.R.Y.",
        subtitle: "Creative Output & Rendering Yield",
        color: "bg-violet-500",
        status: Math.random() > 0.4 ? "online" : "offline",
        tools: ["Canva", "Adobe", "YouTube", "Figma", "Unsplash"],
        lastActivity: `${Math.floor(Math.random() * 60) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 8) + 3,
      },
      {
        key: "ALEX",
        name: "A.L.E.X.",
        subtitle: "Administrative Logistics Executive",
        color: "bg-emerald-500",
        status: Math.random() > 0.2 ? "online" : "offline",
        tools: ["Google Calendar", "Slack", "Notion", "DocuSign", "Zoom"],
        lastActivity: `${Math.floor(Math.random() * 45) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 12) + 8,
      },
      {
        key: "HALI",
        name: "H.A.L.I.",
        subtitle: "Human Assistance & Labor Intelligence",
        color: "bg-orange-500",
        status: Math.random() > 0.5 ? "online" : "offline",
        tools: ["LinkedIn", "BambooHR", "Workday", "Indeed", "Glassdoor"],
        lastActivity: `${Math.floor(Math.random() * 90) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 6) + 2,
      },
      {
        key: "FINT",
        name: "F.I.N.T.",
        subtitle: "Financial Insights & Transactions",
        color: "bg-green-600",
        status: Math.random() > 0.3 ? "online" : "offline",
        tools: ["QuickBooks", "Stripe", "PayPal", "Excel", "Mint"],
        lastActivity: `${Math.floor(Math.random() * 120) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 15) + 10,
      },
      {
        key: "CYRA",
        name: "C.Y.R.A.",
        subtitle: "Cybersecurity Response & Analysis",
        color: "bg-rose-500",
        status: Math.random() > 0.2 ? "online" : "offline",
        tools: ["LastPass", "Norton", "Cloudflare", "VPN", "Firewall"],
        lastActivity: `${Math.floor(Math.random() * 20) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 8) + 4,
      },
      {
        key: "TONY",
        name: "T.O.N.Y.",
        subtitle: "Technical Operations & Network Yield",
        color: "bg-indigo-500",
        status: Math.random() > 0.1 ? "online" : "offline",
        tools: ["GitHub", "AWS", "Docker", "Jenkins", "Monitoring"],
        lastActivity: `${Math.floor(Math.random() * 15) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 20) + 15,
      },
      {
        key: "SAGE",
        name: "S.A.G.E.",
        subtitle: "Social Automation & Growth Engine",
        color: "bg-pink-500",
        status: Math.random() > 0.6 ? "online" : "offline",
        tools: ["Twitter", "Instagram", "Facebook", "TikTok", "Buffer"],
        lastActivity: `${Math.floor(Math.random() * 180) + 1}m ago`,
        tasksCompleted: Math.floor(Math.random() * 5) + 1,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        agents,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Dashboard agents API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch agent data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
