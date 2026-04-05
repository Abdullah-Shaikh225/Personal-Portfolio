import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalVisits: 0,
        todayVisits: 0,
        weekVisits: 0,
        monthVisits: 0,
        liveVisitors: 0,
        cvDownloads: 0,
        totalContacts: 0,
        totalProjects: 0
    });
    const [visitorNames, setVisitorNames] = useState([]);

    useEffect(() => {
        fetchStats();

        // Live visitor subscription
        const channel = supabase
            .channel('live-visitors')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'active_visitors' }, () => {
                fetchLiveVisitors();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const fetchStats = async () => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [allVisits, todayVisits, weekVisits, monthVisits, cvDownloads, contacts, projects, liveVisitors, allNames] = await Promise.all([
            supabase.from('analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'page_visit'),
            supabase.from('analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'page_visit').gte('timestamp', todayStart),
            supabase.from('analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'page_visit').gte('timestamp', weekStart),
            supabase.from('analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'page_visit').gte('timestamp', monthStart),
            supabase.from('cv_downloads').select('id', { count: 'exact', head: true }),
            supabase.from('contacts').select('id', { count: 'exact', head: true }).neq('email', 'visitor-greeting@portfolio.local'),
            supabase.from('projects').select('id', { count: 'exact', head: true }),
            supabase.from('active_visitors').select('id', { count: 'exact', head: true }).gte('last_seen', new Date(now - 60000).toISOString()),
            supabase.from('contacts').select('id, name, created_at').eq('email', 'visitor-greeting@portfolio.local').order('created_at', { ascending: false }).limit(10)
        ]);

        setStats({
            totalVisits: allVisits.count || 0,
            todayVisits: todayVisits.count || 0,
            weekVisits: weekVisits.count || 0,
            monthVisits: monthVisits.count || 0,
            cvDownloads: cvDownloads.count || 0,
            totalContacts: contacts.count || 0,
            totalProjects: projects.count || 0,
            liveVisitors: liveVisitors.count || 0
        });

        if (allNames && allNames.data) {
            setVisitorNames(allNames.data);
        }
    };

    const fetchLiveVisitors = async () => {
        const now = new Date();
        const { count } = await supabase
            .from('active_visitors')
            .select('id', { count: 'exact', head: true })
            .gte('last_seen', new Date(now - 60000).toISOString());
        setStats(prev => ({ ...prev, liveVisitors: count || 0 }));
    };

    const statCards = [
        { label: 'Live Visitors', value: stats.liveVisitors, icon: '🟢', color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Today', value: stats.todayVisits, icon: '📅', color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'This Week', value: stats.weekVisits, icon: '📊', color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'This Month', value: stats.monthVisits, icon: '📈', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'All Time Visits', value: stats.totalVisits, icon: '🌍', color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'CV Downloads', value: stats.cvDownloads, icon: '📄', color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Contact Messages', value: stats.totalContacts, icon: '💬', color: 'text-pink-500', bg: 'bg-pink-50' },
        { label: 'Projects', value: stats.totalProjects, icon: '🚀', color: 'text-cyan-500', bg: 'bg-cyan-50' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text">Dashboard Overview</h1>
                <p className="text-text-light text-sm mt-1">Welcome back, Abdullah. Here's what's happening with your portfolio.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className="admin-card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-xl`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text">{card.value}</p>
                            <p className="text-xs text-text-light font-medium">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Visitor Names */}
            {visitorNames.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-text mb-4">Friendly Visitors 👋</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex flex-wrap gap-3">
                            {visitorNames.map((visitor) => (
                                <div key={visitor.id} className="flex items-center gap-2 bg-background border border-border/50 px-4 py-2 rounded-xl">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <p className="text-sm font-semibold">{visitor.name}</p>
                                    <span className="text-xs text-text-light ml-2">
                                        {new Date(visitor.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
