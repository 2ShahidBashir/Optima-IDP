import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminOverview = ({ profile }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/idp/metrics/system');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch system stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-slate-400">Loading system metrics...</div>;

    return (
        <div className="space-y-6">
            {/* Admin Dashboard Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">System Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-xs">Total Users</p>
                        <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-xs">Active IDPs</p>
                        <p className="text-2xl font-bold text-purple-400">{stats?.activeIDPs || 0}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-xs">Resources</p>
                        <p className="text-2xl font-bold text-blue-400">{stats?.totalResources || 0}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-xs">System Status</p>
                        <p className="text-2xl font-bold text-emerald-400">{stats?.systemStatus || "Unknown"}</p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">System Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-slate-800 hover:bg-slate-750 text-left rounded-lg border border-slate-700 hover:border-slate-600 transition-all group">
                        <h5 className="font-semibold text-white group-hover:text-purple-400 transition-colors">User Management</h5>
                        <p className="text-sm text-slate-400 mt-1">Manage users, roles, and permissions</p>
                    </button>

                    <button className="p-4 bg-slate-800 hover:bg-slate-750 text-left rounded-lg border border-slate-700 hover:border-slate-600 transition-all group">
                        <h5 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Skill Taxonomy</h5>
                        <p className="text-sm text-slate-400 mt-1">Edit skills, categories, and levels</p>
                    </button>

                    <button className="p-4 bg-slate-800 hover:bg-slate-750 text-left rounded-lg border border-slate-700 hover:border-slate-600 transition-all group">
                        <h5 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Resource Library</h5>
                        <p className="text-sm text-slate-400 mt-1">Manage learning resources and content</p>
                    </button>

                    <button className="p-4 bg-slate-800 hover:bg-slate-750 text-left rounded-lg border border-slate-700 hover:border-slate-600 transition-all group">
                        <h5 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Billing & Plans</h5>
                        <p className="text-sm text-slate-400 mt-1">View usage and subscription details</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
