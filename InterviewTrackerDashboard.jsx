import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

// ─── MOCK DATA (replace with API calls) ─────────────────────────────────────
const MOCK_DASHBOARD = {
  totalApplications: 112,
  activeApplications: 18,
  interviewsScheduled: 5,
  offersReceived: 3,
  applicationsByStatus: {
    WISHLIST: 10, APPLIED: 42, SCREENING: 20, INTERVIEW: 18,
    OFFER: 3, REJECTED: 14, WITHDRAWN: 5
  },
  readinessScore: {
    overallScore: 67.5,
    readinessLevel: "STRONG",
    totalTopicsTracked: 38,
    domainScores: [
      { domain: "DSA", displayName: "Data Structures & Algorithms", score: 72, weightage: 40,
        totalTopics: 18, weakTopics: ["Dynamic Programming", "Segment Trees", "Graph Algorithms"] },
      { domain: "SYSTEM_DESIGN", displayName: "System Design", score: 58, weightage: 35,
        totalTopics: 12, weakTopics: ["Database Sharding", "CDN", "Distributed Caching"] },
      { domain: "CORE_JAVA", displayName: "Core Java & CS Fundamentals", score: 81, weightage: 25,
        totalTopics: 8, weakTopics: ["JVM Internals"] },
    ]
  }
};

const MOCK_APPLICATIONS = [
  { id: 1, companyName: "Google", jobRole: "SDE II", status: "INTERVIEW", location: "Bengaluru", appliedDate: "2026-02-10", totalRounds: 4 },
  { id: 2, companyName: "Amazon", jobRole: "SDE I", status: "OFFER", location: "Hyderabad", appliedDate: "2026-02-01", totalRounds: 5 },
  { id: 3, companyName: "Microsoft", jobRole: "Software Engineer", status: "SCREENING", location: "Remote", appliedDate: "2026-02-15", totalRounds: 1 },
  { id: 4, companyName: "Flipkart", jobRole: "Backend Engineer", status: "APPLIED", location: "Bengaluru", appliedDate: "2026-02-20", totalRounds: 0 },
  { id: 5, companyName: "Swiggy", jobRole: "Full Stack Dev", status: "REJECTED", location: "Bengaluru", appliedDate: "2026-01-25", totalRounds: 3 },
  { id: 6, companyName: "Zepto", jobRole: "Java Developer", status: "INTERVIEW", location: "Mumbai", appliedDate: "2026-02-18", totalRounds: 2 },
  { id: 7, companyName: "Atlassian", jobRole: "Platform Engineer", status: "APPLIED", location: "Remote", appliedDate: "2026-02-22", totalRounds: 0 },
  { id: 8, companyName: "Razorpay", jobRole: "Backend Engineer", status: "SCREENING", location: "Bengaluru", appliedDate: "2026-02-19", totalRounds: 1 },
];

const MOCK_TOPICS = [
  { id: 1, topicName: "Arrays & Strings", domain: "DSA", confidenceScore: 90, status: "COMPLETED" },
  { id: 2, topicName: "Trees & Graphs", domain: "DSA", confidenceScore: 75, status: "IN_PROGRESS" },
  { id: 3, topicName: "Dynamic Programming", domain: "DSA", confidenceScore: 40, status: "IN_PROGRESS" },
  { id: 4, topicName: "Graph Algorithms", domain: "DSA", confidenceScore: 35, status: "IN_PROGRESS" },
  { id: 5, topicName: "Load Balancers", domain: "SYSTEM_DESIGN", confidenceScore: 70, status: "IN_PROGRESS" },
  { id: 6, topicName: "Database Sharding", domain: "SYSTEM_DESIGN", confidenceScore: 30, status: "IN_PROGRESS" },
  { id: 7, topicName: "Spring Boot", domain: "CORE_JAVA", confidenceScore: 92, status: "COMPLETED" },
  { id: 8, topicName: "JVM Internals", domain: "CORE_JAVA", confidenceScore: 45, status: "NEEDS_REVISION" },
];

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  WISHLIST: "#64748b", APPLIED: "#3b82f6", SCREENING: "#f59e0b",
  INTERVIEW: "#8b5cf6", OFFER: "#10b981", REJECTED: "#ef4444", WITHDRAWN: "#6b7280"
};
const STATUS_LABELS = {
  WISHLIST: "Wishlist", APPLIED: "Applied", SCREENING: "Screening",
  INTERVIEW: "Interview", OFFER: "Offer", REJECTED: "Rejected", WITHDRAWN: "Withdrawn"
};
const DOMAIN_COLORS = { DSA: "#6366f1", SYSTEM_DESIGN: "#f59e0b", CORE_JAVA: "#10b981" };
const READINESS_COLOR = { INTERVIEW_READY: "#10b981", STRONG: "#6366f1", MODERATE: "#f59e0b", DEVELOPING: "#f97316", BEGINNER: "#ef4444" };

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 120, color = "#6366f1", label }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={size * 0.2} fontWeight="700">{score}</text>
      </svg>
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
    <div className={`ml-auto w-1 h-10 rounded-full`} style={{ background: color }} />
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ background: STATUS_COLORS[status] + "33", color: STATUS_COLORS[status] }}>
    {STATUS_LABELS[status]}
  </span>
);

const DomainBadge = ({ domain }) => {
  const labels = { DSA: "DSA", SYSTEM_DESIGN: "System Design", CORE_JAVA: "Core Java" };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: DOMAIN_COLORS[domain] + "22", color: DOMAIN_COLORS[domain] }}>
      {labels[domain]}
    </span>
  );
};

const ProgressBar = ({ value, color, height = 6 }) => (
  <div className="bg-slate-700 rounded-full overflow-hidden" style={{ height }}>
    <div className="h-full rounded-full transition-all duration-500"
      style={{ width: `${Math.min(value, 100)}%`, background: color }} />
  </div>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [topics, setTopics] = useState(MOCK_TOPICS);
  const [dashboard] = useState(MOCK_DASHBOARD);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newApp, setNewApp] = useState({ companyName: "", jobRole: "", status: "APPLIED", location: "" });
  const [newTopic, setNewTopic] = useState({ topicName: "", domain: "DSA", confidenceScore: 50, status: "IN_PROGRESS" });

  const filteredApps = applications.filter(a => {
    const matchSearch = a.companyName.toLowerCase().includes(search.toLowerCase()) ||
                        a.jobRole.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pieData = Object.entries(dashboard.applicationsByStatus)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABELS[k], value: v, color: STATUS_COLORS[k] }));

  const radarData = dashboard.readinessScore.domainScores.map(d => ({
    subject: d.domain === "SYSTEM_DESIGN" ? "Sys Design" : d.domain === "CORE_JAVA" ? "Core Java" : d.domain,
    score: d.score, fullMark: 100
  }));

  const barData = topics
    .sort((a, b) => a.confidenceScore - b.confidenceScore)
    .slice(0, 8)
    .map(t => ({ name: t.topicName.length > 14 ? t.topicName.slice(0, 14) + "…" : t.topicName, score: t.confidenceScore, domain: t.domain }));

  const handleAddApp = () => {
    if (!newApp.companyName || !newApp.jobRole) return;
    setApplications(prev => [{ ...newApp, id: Date.now(), appliedDate: new Date().toISOString().split("T")[0], totalRounds: 0 }, ...prev]);
    setNewApp({ companyName: "", jobRole: "", status: "APPLIED", location: "" });
    setShowAddApp(false);
  };

  const handleAddTopic = () => {
    if (!newTopic.topicName) return;
    setTopics(prev => [{ ...newTopic, id: Date.now() }, ...prev]);
    setNewTopic({ topicName: "", domain: "DSA", confidenceScore: 50, status: "IN_PROGRESS" });
    setShowAddTopic(false);
  };

  const levelColor = READINESS_COLOR[dashboard.readinessScore.readinessLevel];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "applications", label: "Applications", icon: "💼" },
    { id: "preparation", label: "Preparation", icon: "📚" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Space Grotesk', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .card-hover { transition: transform 0.15s, border-color 0.15s; }
        .card-hover:hover { transform: translateY(-1px); border-color: #6366f1 !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold">IT</div>
          <span className="font-bold text-lg tracking-tight">Interview<span className="text-indigo-400">Tracker</span></span>
        </div>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">JD</div>
          <span className="text-sm text-slate-400 hidden md:block">John Dev</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ══════════════════════════ DASHBOARD ══════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Good morning, John 👋</h1>
              <p className="text-slate-400 text-sm mt-1">Here's your interview prep snapshot</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Applications" value={dashboard.totalApplications} icon="📋" color="#3b82f6" />
              <StatCard label="Active Interviews" value={dashboard.activeApplications} icon="🎯" color="#8b5cf6" />
              <StatCard label="Upcoming Rounds" value={dashboard.interviewsScheduled} icon="📅" color="#f59e0b" />
              <StatCard label="Offers Received" value={dashboard.offersReceived} icon="🏆" color="#10b981" />
            </div>

            {/* Readiness + Domains */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center justify-center gap-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overall Readiness</h2>
                <ScoreRing score={Math.round(dashboard.readinessScore.overallScore)} size={140} color={levelColor} />
                <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: levelColor + "22", color: levelColor }}>
                  {dashboard.readinessScore.readinessLevel.replace("_", " ")}
                </span>
                <p className="text-xs text-slate-500 text-center">
                  {dashboard.readinessScore.totalTopicsTracked} topics tracked across 3 domains
                </p>
              </div>

              {/* Domain Scores */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Domain Scores</h2>
                {dashboard.readinessScore.domainScores.map(d => (
                  <div key={d.domain}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-300">{d.displayName}</span>
                      <span className="font-bold" style={{ color: DOMAIN_COLORS[d.domain] }}>{d.score}%</span>
                    </div>
                    <ProgressBar value={d.score} color={DOMAIN_COLORS[d.domain]} height={8} />
                    <div className="text-xs text-slate-500 mt-1">{d.weightage}% weight · {d.totalTopics} topics</div>
                  </div>
                ))}
              </div>

              {/* Radar Chart */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Skill Radar</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Application Funnel + Weak Areas */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Application Pipeline</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Weak Areas */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">🔴 Weak Areas to Focus</h2>
                <div className="space-y-3">
                  {dashboard.readinessScore.domainScores.flatMap(d =>
                    d.weakTopics.map(t => ({ topic: t, domain: d.domain }))
                  ).slice(0, 6).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{item.topic}</div>
                        <DomainBadge domain={item.domain} />
                      </div>
                      <span className="text-xs text-red-400 font-semibold">Needs Work</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ APPLICATIONS ══════════════════════════ */}
        {activeTab === "applications" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Job Applications</h1>
                <p className="text-slate-400 text-sm">{applications.length} applications tracked</p>
              </div>
              <button onClick={() => setShowAddApp(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                + Add Application
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search company or role..."
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-64" />
              <div className="flex gap-2 flex-wrap">
                {["ALL", ...Object.keys(STATUS_COLORS)].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterStatus === s ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                    }`}>
                    {s === "ALL" ? "All" : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Application Modal */}
            {showAddApp && (
              <div className="bg-slate-800 border border-indigo-500 rounded-2xl p-5 grid grid-cols-2 gap-4">
                <h3 className="col-span-2 font-bold text-lg text-indigo-400">New Application</h3>
                {[
                  { key: "companyName", placeholder: "Company Name *" },
                  { key: "jobRole", placeholder: "Job Role *" },
                  { key: "location", placeholder: "Location" },
                ].map(f => (
                  <input key={f.key} placeholder={f.placeholder} value={newApp[f.key]}
                    onChange={e => setNewApp(p => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500" />
                ))}
                <select value={newApp.status} onChange={e => setNewApp(p => ({ ...p, status: e.target.value }))}
                  className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white outline-none">
                  {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <div className="col-span-2 flex gap-3 justify-end">
                  <button onClick={() => setShowAddApp(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white">Cancel</button>
                  <button onClick={handleAddApp} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">Save</button>
                </div>
              </div>
            )}

            {/* Applications Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                <div className="col-span-3">Company</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1">Rounds</div>
                <div className="col-span-1">Applied</div>
              </div>
              <div className="divide-y divide-slate-700">
                {filteredApps.map(app => (
                  <div key={app.id} className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-750 card-hover cursor-pointer items-center">
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {app.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-white">{app.companyName}</span>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm text-slate-300">{app.jobRole}</div>
                    <div className="col-span-2"><StatusBadge status={app.status} /></div>
                    <div className="col-span-2 text-sm text-slate-400">{app.location}</div>
                    <div className="col-span-1">
                      <span className="text-sm font-semibold text-indigo-400">{app.totalRounds}</span>
                    </div>
                    <div className="col-span-1 text-xs text-slate-500">{app.appliedDate}</div>
                  </div>
                ))}
              </div>
            </div>
            {filteredApps.length === 0 && (
              <div className="text-center py-10 text-slate-500">No applications found. Try adjusting your filters.</div>
            )}
          </div>
        )}

        {/* ══════════════════════════ PREPARATION ══════════════════════════ */}
        {activeTab === "preparation" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Preparation Tracker</h1>
                <p className="text-slate-400 text-sm">{topics.length} topics tracked</p>
              </div>
              <button onClick={() => setShowAddTopic(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                + Add Topic
              </button>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { domain: "DSA", label: "DSA", score: 72 },
                { domain: "SYSTEM_DESIGN", label: "System Design", score: 58 },
                { domain: "CORE_JAVA", label: "Core Java", score: 81 },
              ].map(d => (
                <div key={d.domain} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 text-center">
                  <ScoreRing score={d.score} size={90} color={DOMAIN_COLORS[d.domain]} />
                  <div className="mt-2 text-sm font-semibold text-slate-300">{d.label}</div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Topic Confidence Scores (Lowest First)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={110} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={DOMAIN_COLORS[entry.domain]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Add Topic Modal */}
            {showAddTopic && (
              <div className="bg-slate-800 border border-indigo-500 rounded-2xl p-5 grid grid-cols-2 gap-4">
                <h3 className="col-span-2 font-bold text-lg text-indigo-400">Add Topic</h3>
                <input placeholder="Topic Name *" value={newTopic.topicName}
                  onChange={e => setNewTopic(p => ({ ...p, topicName: e.target.value }))}
                  className="col-span-2 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500" />
                <select value={newTopic.domain} onChange={e => setNewTopic(p => ({ ...p, domain: e.target.value }))}
                  className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white outline-none">
                  {["DSA", "SYSTEM_DESIGN", "CORE_JAVA"].map(d => <option key={d}>{d}</option>)}
                </select>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Confidence: {newTopic.confidenceScore}%</label>
                  <input type="range" min="0" max="100" value={newTopic.confidenceScore}
                    onChange={e => setNewTopic(p => ({ ...p, confidenceScore: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500" />
                </div>
                <div className="col-span-2 flex gap-3 justify-end">
                  <button onClick={() => setShowAddTopic(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white">Cancel</button>
                  <button onClick={handleAddTopic} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">Save</button>
                </div>
              </div>
            )}

            {/* Topics Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                <div className="col-span-4">Topic</div>
                <div className="col-span-2">Domain</div>
                <div className="col-span-4">Confidence</div>
                <div className="col-span-2">Status</div>
              </div>
              <div className="divide-y divide-slate-700">
                {topics.map(t => (
                  <div key={t.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center card-hover">
                    <div className="col-span-4 font-medium text-sm text-white">{t.topicName}</div>
                    <div className="col-span-2"><DomainBadge domain={t.domain} /></div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={t.confidenceScore} color={t.confidenceScore >= 70 ? "#10b981" : t.confidenceScore >= 40 ? "#f59e0b" : "#ef4444"} />
                        <span className="text-xs font-bold w-8 text-right" style={{ color: t.confidenceScore >= 70 ? "#10b981" : t.confidenceScore >= 40 ? "#f59e0b" : "#ef4444" }}>
                          {t.confidenceScore}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-medium text-slate-400"
                        style={{ color: t.status === "COMPLETED" ? "#10b981" : t.status === "NEEDS_REVISION" ? "#ef4444" : "#94a3b8" }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
