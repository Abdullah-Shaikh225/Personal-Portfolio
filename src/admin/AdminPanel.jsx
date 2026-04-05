import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AdminOverview from './AdminOverview';
import AdminProjects from './AdminProjects';
import AdminCertifications from './AdminCertifications';
import AdminSkills from './AdminSkills';
import AdminContacts from './AdminContacts';
import AdminAnalytics from './AdminAnalytics';
import AdminLogin from './AdminLogin';
import AdminSettings from './AdminSettings';
import AdminProfile from './AdminProfile';

const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'profile', label: 'Profile', icon: '🖼️' },
    { key: 'projects', label: 'Projects', icon: '🚀' },
    { key: 'certifications', label: 'Certifications', icon: '🏆' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'contacts', label: 'Contacts', icon: '📨' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
    { key: 'security', label: 'Security', icon: '🔒' },
];

export default function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('adminAuthenticated') === 'true'
    );
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const configured = isSupabaseConfigured();

    const handleLogout = () => {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminUsername');
        setIsAuthenticated(false);
    };

    const renderTab = () => {
        if (!configured) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="admin-card max-w-md text-center p-8">
                        <p className="text-4xl mb-4">⚙️</p>
                        <h2 className="text-xl font-bold mb-2">Supabase Not Configured</h2>
                        <p className="text-text-light text-sm">
                            Add your Supabase URL and anon key to the <code className="bg-gray-100 px-2 py-1 rounded text-xs">.env</code> file to enable the admin panel.
                        </p>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview': return <AdminOverview />;
            case 'profile': return <AdminProfile />;
            case 'projects': return <AdminProjects />;
            case 'certifications': return <AdminCertifications />;
            case 'skills': return <AdminSkills />;
            case 'contacts': return <AdminContacts />;
            case 'analytics': return <AdminAnalytics />;
            case 'security': return <AdminSettings />;
            default: return <AdminOverview />;
        }
    };

    if (!isAuthenticated && configured) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col shrink-0`}>
                <div className="p-6 border-b border-white/10">
                    <h1 className={`text-white font-bold ${sidebarOpen ? 'text-xl' : 'text-center text-sm'}`}>
                        {sidebarOpen ? '🛡️ Admin Panel' : '🛡️'}
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab.key
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {sidebarOpen && <span>{tab.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-all cursor-pointer"
                    >
                        {sidebarOpen ? '◀ Collapse' : '▶'}
                    </button>
                    <a
                        href="/"
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-all"
                    >
                        {sidebarOpen ? '← Back to Portfolio' : '←'}
                    </a>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-danger hover:text-white hover:bg-danger/20 text-sm transition-all cursor-pointer"
                    >
                        {sidebarOpen ? '🔓 Logout' : '🔓'}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {renderTab()}
                </div>
            </div>
        </div>
    );
}
