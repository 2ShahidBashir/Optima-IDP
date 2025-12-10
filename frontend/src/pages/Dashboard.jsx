import { useEffect, useState } from 'react';
import { useAuth } from '../store/useAuth.jsx';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const [metrics, setMetrics] = useState(null);
  const [activeIDPs, setActiveIDPs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (role === 'employee') {
          const [metricsRes, idpsRes] = await Promise.all([
            api.get('/idp/metrics/employee'),
            api.get('/idp/my-idps')
          ]);
          setMetrics(metricsRes.data);
          // Filter for active IDPs (not completed)
          const active = idpsRes.data.idps.filter(idp =>
            ['draft', 'pending', 'approved', 'processing'].includes(idp.status)
          );
          setActiveIDPs(active);
        } else if (role === 'manager') {
          const res = await api.get('/idp/metrics/team');
          setMetrics(res.data);
        } else if (role === 'admin') {
          const res = await api.get('/idp/metrics/system');
          setMetrics(res.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  const getHeadline = () => {
    if (role === 'employee') return `Welcome back, ${user.name.split(' ')[0]}`;
    if (role === 'manager') return 'Team Overview';
    if (role === 'admin') return 'System Administration';
    return 'Dashboard';
  };

  const renderStats = () => {
    if (!metrics) return null;

    if (role === 'employee') {
      return (
        <>
          <StatCard label="Total Plans" value={metrics.totalIDPs} color="purple" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <StatCard label="Active Goals" value={metrics.inProgressIDPs} color="blue" icon="M13 10V3L4 14h7v7l9-11h-7z" />
          <StatCard label="Completed" value={metrics.completedIDPs} color="emerald" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="Current Level" value={metrics.skillGrowth?.[metrics.skillGrowth.length - 1]?.level || "N/A"} color="pink" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </>
      );
    }
    if (role === 'manager') {
      return (
        <>
          <StatCard label="Total Reports" value={metrics.totalReports} color="blue" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          <StatCard label="Pending Reviews" value={metrics.pendingApprovals} color="amber" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="Team Avg Skill" value={metrics.teamAvgSkill} color="indigo" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </>
      );
    }
    if (role === 'admin') {
      return (
        <>
          <StatCard label="Total Users" value={metrics.totalUsers} color="slate" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <StatCard label="Active IDPs" value={metrics.activeIDPs} color="purple" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <StatCard label="Resources" value={metrics.totalResources} color="emerald" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          <StatCard label="System Status" value={metrics.systemStatus} color="green" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 mb-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-purple-400 font-semibold tracking-wide uppercase text-xs mb-2">Optima IDP</p>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
            {getHeadline()}
          </h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
            {role === 'employee' ? "Track your progress and manage your personalized development plans." :
              role === 'manager' ? "Monitor your team's growth and approve development requests." :
                "System administration and overview."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/profile" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
              View Full Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? <div className="text-slate-500 col-span-4 text-center py-8">Loading metrics...</div> : renderStats()}
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Activity or Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {role === 'employee' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Learning Plans</h3>
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : activeIDPs.length > 0 ? (
                <div className="space-y-4">
                  {activeIDPs.map(idp => (
                    <div key={idp._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{idp.goals}</h4>
                          <p className="text-sm text-slate-400">
                            Focus: {idp.skillsToImprove.map(s => s.skill?.name).join(', ')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase border ${idp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            idp.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-slate-700 text-slate-300 border-slate-600'
                          }`}>
                          {idp.status}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
                        {/* Mock progress based on status for active plans */}
                        <div className={`h-full rounded-full ${idp.status === 'approved' ? 'bg-emerald-500 w-1/4' : 'bg-slate-600 w-0'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No active plans. Create one!</p>
              )}
            </div>
          )}

          {role === 'manager' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/profile" className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group">
                  <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Review Pending Approvals</h4>
                  <p className="text-sm text-slate-400 mt-1">Check pending IDP requests from your team.</p>
                </Link>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl opacity-60">
                  <h4 className="font-semibold text-slate-300">Schedule Performance Reviews</h4>
                  <p className="text-sm text-slate-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/profile" className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group">
                  <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Manage Users</h4>
                  <p className="text-sm text-slate-400 mt-1">Add, edit, or remove users.</p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentActivity.map((activity) => (
                  <div key={activity.id} className="relative pl-4 border-l-2 border-slate-800">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
                    <p className="text-sm text-slate-300">{activity.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No recent activity.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const colors = {
    purple: 'text-purple-400 bg-purple-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10',
    slate: 'text-slate-400 bg-slate-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
    green: 'text-green-400 bg-green-500/10'
  };

  return (
    <article className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{label}</p>
        <div className={`p-2 rounded-lg ${colors[color] || colors.slate}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
    </article>
  );
}

export default Dashboard;

